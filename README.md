## Taut
#### http server for saving & retrieving raw data objects, in a graph tree



| METHOD | End-point    | Description                                 |
| ------ | ------------ | ------------------------------------------- |
| `GET`  | `/health`    | Returns basic health information (used for load balancing)  |
| `POST` | `/:hashname` | Store an asset with the specified hashname            |
| `GET`  | `/:hashname` | Get an existing asset with the specified hashname     |

* Note that the `id` is the md5 hash of the contents of the asset appended with the media type of `png|svg|wav|json|...`

## Configuration
| Variable                   | Type     | Description                                 |
| -------------------------- | -------- | ------------------------------------------- |
| `AWS_S3_BUCKET`            | `String` | S3 bucket for saving / getting objects      |
| `AWS_ACCESS_KEY_ID`        | `String` | AWS access key (if AWS_S3_BUCKET is set)    | 
| `AWS_SECRET_ACCESS_KEY`    | `String` | AWS secret key (if AWS_S3_BUCKET is set)    |
| `CONNECT_TIMEOUT`          | `number` | Backend connection timeout (1.5 seconds)    |
| `DATA_TIMEOUT`             | `number` | No streaming data timeout (15 seconds)      |
| `MAX_OBJECT_SIZE_BYTES`    | `number` | Maximum size of objects uploaded in bytes   |
|                            |          |                                             |
| `EB_AWS_ACCESS_KEY_ID`     | `String` | AWS access key for deployment               |
| `EB_AWS_SECRET_ACCESS_KEY` | `String` | AWS secret key for deployment               |


## Docker usage
This repository ships with an `env.sample` file that provides the names of these environment variables. Copy this file to `.env` and populate with correct values.

### Start up

```bash
docker-compose up
```

### Tear down

```bash
docker-compose down -v
```

### Examples Accessing

```bash
curl http://localhost:8557/health
curl -H "Content-type: application/octet-stream" -H "Cookie: session..."--data-binary @a.png http://localhost:8557/eed459aa6ca84d7403768731519d60d3.png
curl http://localhost:8557/eed459aa6ca84d7403768731519d60d3.png
```

You can attach to the running docker container and run the tests:

```bash
docker exec -it taut bash
npm test
```

## Running (non-docker)
```bash
npm start
```

## Testing (in docker container or outside of it)
```bash
npm test
```

```bash
make coverage
```

## Load Testing

### Test GETs and one upload
```bash
make load
```

### Test raw uploading performance
```bash
make upload
```

This will perform the following:
* Clear out any previous test data named `./tmp/*.dat`
* Generate test files in `./tmp`:
  * Distribution of sizes
    * 25 large files 3.5-10MB
    * 75 medium sized files 50KB-1.25MB
    * 200 small files 1KB-45KB 
  * Named MD5HASH.dat
* Will run `wrk` using `./test/fixtures/post_a_lot.lua` to load all test data into memory
  * Will be uploaded to the backend store configured for staging.
  * Will run for 30s
  * Known issue: the estimation of the transfer rate appears to be wrong in `wrk`
  

