use retrom_codegen::retrom::{Game, NewGameMetadata, NewPlatformMetadata, Platform};

pub mod igdb;

pub trait MetadataProvider<Query, Data> {
    async fn search_metadata(&self, query: Query) -> Option<Data>;
}

pub trait GameMetadataProvider<Query> {
    async fn get_game_metadata(&self, game: Game, query: Option<Query>) -> Option<NewGameMetadata>;
    async fn search_game_metadata(&self, query: Query) -> Vec<NewGameMetadata>;
}

pub trait PlatformMetadataProvider<Query> {
    async fn get_platform_metadata(
        &self,
        platform: Platform,
        query: Option<Query>,
    ) -> Option<NewPlatformMetadata>;

    async fn search_platform_metadata(&self, query: Query) -> Vec<NewPlatformMetadata>;
}
