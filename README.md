<p align="center">
    <img src="https://res.cloudinary.com/dermasmid/image/upload/v1603739999/taxi-icon_ndy6wy.png">
</p>

# Getting Started

``` bash
git clone https://github.com/dermasmid/taxi-demo
cd taxi-demo
```

Now open the Docker file and enter your google api key

```
ENV APIKEY=your_key_here
```

Then you can build and start the container

``` bash
docker-compose build
docker-compose up
```

Now open a browser and go to [localhost:3000](http://localhost:3000/)

## Note

The container is meant to run locally because it tries to access a socket on localhost
and it needs access to the users location which is not possible over the internet with an insecure connection
