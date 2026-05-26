#RUN

cd ~/besu-network
docker compose up -d
docker logs -f besu-node

#TEST

curl -X POST http://127.0.0.1:8545 \
-H "Content-Type: application/json" \
--data-raw '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'