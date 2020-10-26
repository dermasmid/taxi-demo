<p align="center">
    <img src="https://res.cloudinary.com/dermasmid/image/upload/v1603739999/taxi-icon_ndy6wy.png">
</p>

# Getting Started

``` bash
git clone https://github.com/dermasmid/taxi-demo
cd taxi-demo
docker-compose build
docker-compose up -d

```

Now open a browser and go to [localhost:3000](http://localhost:3000/)

## Note

The container is meant to run locally because it tries to access a socket on localhost
and it needs access to the users location which is not possible over the internet with an insecure connection
