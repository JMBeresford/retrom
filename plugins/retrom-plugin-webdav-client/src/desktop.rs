use crate::error::{Error, Result};
use headers::HeaderMapExt;
use http::{Method, Uri};
use reqwest::{Body, Response};
use retrom_plugin_config::ConfigExt;
use serde::de::DeserializeOwned;
use std::{
    fmt::Debug,
    path::{Path, PathBuf},
};
use tauri::{plugin::PluginApi, AppHandle, Runtime};
use tracing::instrument;
use url::Url;
use webdav_meta::{
    headers::{self as dav_headers, Depth},
    methods as dav_methods,
    xml::{
        elements::{LockInfo, PropertyUpdate, Propfind},
        IntoXml,
    },
};

#[derive(Debug, Clone)]
pub struct PutOptions {
    pub headers: Option<http::HeaderMap>,
}

#[derive(Debug, Clone)]
pub struct MkcolOptions {
    pub headers: Option<http::HeaderMap>,
}

#[derive(Debug, Clone)]
pub struct DeleteOptions {
    pub headers: Option<http::HeaderMap>,
}

#[derive(Debug, Clone)]
pub struct PropFindOptions {
    pub depth: dav_headers::Depth,
    pub prop_find: Propfind,
}

#[derive(Debug, Clone)]
pub struct PropPatchOptions {
    pub headers: Option<http::HeaderMap>,
    pub property_update: PropertyUpdate,
}

#[derive(Debug, Clone)]
pub struct CopyOptions {
    pub overwrite: dav_headers::Overwrite,
    pub depth: dav_headers::Depth,
}

#[derive(Debug, Clone)]
pub struct LockOptions {
    pub depth: dav_headers::Depth,
    pub timeout: dav_headers::Timeout,
    pub lock_info: Option<LockInfo>,
}

#[derive(Debug, Clone)]
pub struct UnlockOptions {
    pub lock_token: dav_headers::LockToken,
}

impl Default for LockOptions {
    fn default() -> Self {
        Self {
            depth: dav_headers::Depth::Infinity,
            timeout: dav_headers::Timeout::Infinite,
            lock_info: None,
        }
    }
}

impl Default for CopyOptions {
    fn default() -> Self {
        Self {
            overwrite: Default::default(),
            depth: dav_headers::Depth::Infinity,
        }
    }
}

pub fn init<R: Runtime, C: DeserializeOwned>(
    app: &AppHandle<R>,
    _api: PluginApi<R, C>,
) -> crate::Result<WebDAVClient<R>> {
    Ok(WebDAVClient::new(app.clone()))
}

/// Access to the webdav-client APIs.
pub struct WebDAVClient<R: Runtime> {
    app_handle: AppHandle<R>,
    http_client: reqwest::Client,
}

impl<R: Runtime> WebDAVClient<R> {
    fn new(app_handle: AppHandle<R>) -> Self {
        let http_client = reqwest::Client::new();

        Self {
            app_handle,
            http_client,
        }
    }

    async fn get_host(&self) -> Result<Url> {
        let server = self
            .app_handle
            .config_manager()
            .get_config()
            .await
            .server
            .ok_or(Error::InvalidConfig(
                "No server found in configuration".into(),
            ))?;

        let mut host = server.hostname;

        if let Some(port) = server.port {
            host = format!("{}:{}", host, port);
        }

        let host = Url::parse(&host)?;

        tracing::debug!("Using WebDAV host: {}", host);

        Ok(host)
    }

    pub(crate) async fn make_resource_url<Resource: AsRef<Path> + Debug>(
        &self,
        resource: Resource,
    ) -> Result<Url> {
        use std::path::Component;
        let mut relative_path = resource.as_ref().to_path_buf();

        if relative_path.has_root() {
            relative_path = relative_path
                .components()
                .filter(|c| !matches!(c, Component::RootDir | Component::Prefix(_)))
                .collect();

            if relative_path.as_os_str().is_empty() {
                relative_path.push(".");
            }
        }

        let resource_path = PathBuf::from("dav").join(relative_path);
        let resource_path_str = resource_path.to_str().ok_or_else(|| {
            Error::Other("Resource path contains invalid UTF-8 characters".into())
        })?;

        let url = self.get_host().await?.join(resource_path_str)?;

        tracing::debug!("Resource URL: {}", url);

        Ok(url)
    }

    pub(crate) async fn build_request<Resource: AsRef<Path> + Debug>(
        &self,
        method: Method,
        resource: Resource,
    ) -> Result<reqwest::RequestBuilder> {
        let url = self.make_resource_url(resource).await?;
        Ok(self.http_client.request(method, url))
    }

    fn add_xml_body<E: IntoXml>(
        request: reqwest::RequestBuilder,
        elem: E,
    ) -> Result<reqwest::RequestBuilder> {
        let mut headers = http::HeaderMap::new();
        headers.typed_insert(headers::ContentType::xml());

        let body_bytes = elem.into_xml()?;
        tracing::debug!("XML Body: {}", String::from_utf8_lossy(&body_bytes));

        Ok(request.body(body_bytes).headers(headers))
    }

    #[instrument(skip(self))]
    pub async fn get<Resource: AsRef<Path> + Debug>(&self, resource: Resource) -> Result<Response> {
        tracing::info!("GET {:?}", resource.as_ref());
        let request = self.build_request(Method::GET, resource).await?;
        Ok(request.send().await?)
    }

    #[instrument(skip(self, body))]
    pub async fn put<B: Into<Body>, Resource: AsRef<Path> + Debug>(
        &self,
        body: B,
        resource: Resource,
        opts: Option<PutOptions>,
    ) -> Result<Response> {
        tracing::info!("PUT {:?}", resource.as_ref());

        let mut headers = http::HeaderMap::new();
        headers.typed_insert(headers::ContentType::octet_stream());

        tracing::info!("PUT headers: {:?}", headers);
        if let Some(opts) = opts {
            if let Some(custom_headers) = opts.headers {
                headers.extend(custom_headers);
            }
        }
        tracing::info!("PUT headers: {:?}", headers);

        let request = self
            .build_request(Method::PUT, resource)
            .await?
            .headers(headers)
            .body(body);

        Ok(request.send().await?)
    }

    #[instrument(skip(self))]
    pub async fn delete<Resource: AsRef<Path> + Debug>(
        &self,
        resource: Resource,
        opts: Option<DeleteOptions>,
    ) -> Result<Response> {
        tracing::info!("DELETE {:?}", resource.as_ref());

        let mut request = self.build_request(Method::DELETE, resource).await?;

        if let Some(opts) = opts {
            if let Some(custom_headers) = opts.headers {
                request = request.headers(custom_headers);
            }
        }

        Ok(request.send().await?)
    }

    #[instrument(skip(self))]
    pub async fn mkcol<Resource: AsRef<Path> + Debug>(
        &self,
        resource: Resource,
        opts: Option<MkcolOptions>,
    ) -> Result<Response> {
        tracing::info!("MKCOL {:?}", resource.as_ref());

        let mut request = self
            .build_request(dav_methods::MKCOL.clone(), resource)
            .await?;

        if let Some(opts) = opts {
            if let Some(custom_headers) = opts.headers {
                request = request.headers(custom_headers);
            }
        }

        Ok(request.send().await?)
    }

    #[instrument(skip(self))]
    pub async fn copy<Resource: AsRef<Path> + Debug>(
        &self,
        resource: Resource,
        destination: Resource,
        opts: Option<CopyOptions>,
    ) -> Result<Response> {
        tracing::info!("COPY {:?} to {:?}", resource.as_ref(), destination.as_ref());

        let opts = opts.unwrap_or_default();

        let destination: Uri = self
            .make_resource_url(destination)
            .await?
            .to_string()
            .parse()?;

        let mut headers = http::HeaderMap::new();
        headers.typed_insert(dav_headers::Destination(destination));
        headers.typed_insert(opts.overwrite);
        headers.typed_insert(opts.depth);

        let request = self
            .build_request(dav_methods::COPY.clone(), resource)
            .await?
            .headers(headers);

        Ok(request.send().await?)
    }

    #[instrument(skip(self))]
    pub async fn r#move<Resource: AsRef<Path> + Debug>(
        &self,
        resource: Resource,
        destination: Resource,
        opts: Option<CopyOptions>,
    ) -> Result<Response> {
        tracing::info!("MOVE {:?} to {:?}", resource.as_ref(), destination.as_ref());

        let opts = opts.unwrap_or_default();

        let destination: Uri = self
            .make_resource_url(destination)
            .await?
            .to_string()
            .parse()?;

        let mut headers = http::HeaderMap::new();
        headers.typed_insert(dav_headers::Destination(destination));
        headers.typed_insert(opts.overwrite);
        headers.typed_insert(opts.depth);

        let request = self
            .build_request(dav_methods::MOVE.clone(), resource)
            .await?
            .headers(headers);

        Ok(request.send().await?)
    }

    #[instrument(skip(self))]
    pub async fn propfind<Resource: AsRef<Path> + Debug>(
        &self,
        resource: Resource,
        opts: PropFindOptions,
    ) -> Result<Response> {
        tracing::info!("PROPFIND {:?}", resource.as_ref());

        let mut headers = http::HeaderMap::new();
        if opts.depth == Depth::Infinity {
            // see: https://github.com/messense/dav-server-rs/issues/55
            headers.insert("x-litmus", http::HeaderValue::from_static("1"));
        }

        headers.typed_insert(opts.depth);

        let mut request = self
            .build_request(dav_methods::PROPFIND.clone(), resource)
            .await?
            .headers(headers);

        request = Self::add_xml_body(request, opts.prop_find)?;

        Ok(request.send().await?)
    }

    #[instrument(skip(self))]
    pub async fn proppatch<Resource: AsRef<Path> + Debug>(
        &self,
        resource: Resource,
        opts: PropPatchOptions,
    ) -> Result<Response> {
        tracing::info!("PROPPATCH {:?}", resource.as_ref());

        let mut request = self
            .build_request(dav_methods::PROPPATCH.clone(), resource)
            .await?;

        if let Some(custom_headers) = opts.headers {
            request = request.headers(custom_headers);
        }

        request = Self::add_xml_body(request, opts.property_update)?;

        Ok(request.send().await?)
    }

    #[instrument(skip(self))]
    pub async fn lock<Resource: AsRef<Path> + Debug>(
        &self,
        resource: Resource,
        opts: Option<LockOptions>,
    ) -> Result<Response> {
        tracing::info!("LOCK {:?}", resource.as_ref());

        let opts = opts.unwrap_or_default();

        let mut headers = http::HeaderMap::new();
        headers.typed_insert(opts.depth);
        headers.typed_insert(opts.timeout);

        let mut request = self
            .build_request(dav_methods::LOCK.clone(), resource)
            .await?
            .headers(headers);

        if let Some(lock_info) = opts.lock_info {
            let body_bytes = lock_info.into_xml()?;
            request = request.body(body_bytes);
        }

        Ok(request.send().await?)
    }

    #[instrument(skip(self))]
    pub async fn unlock<Resource: AsRef<Path> + Debug>(
        &self,
        resource: Resource,
        opts: UnlockOptions,
    ) -> Result<Response> {
        tracing::info!("UNLOCK {:?}", resource.as_ref());

        let mut headers = http::HeaderMap::new();
        headers.typed_insert(opts.lock_token);

        let request = self
            .build_request(dav_methods::UNLOCK.clone(), resource)
            .await?
            .headers(headers);

        Ok(request.send().await?)
    }
}
