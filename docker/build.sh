cd ..
docker build -t retrom-web -f docker/web.Dockerfile .
docker build -t retrom-service -f docker/service.Dockerfile .
