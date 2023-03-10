#!/usr/bin/env bash

# This script brings up the application in a DEVELOPMENT ENVIRONMENT.
# All components are containerized with the exception of smart contract-related
# steps (i.e. bringing up a development network and deploying the contract).

# Fix ownership issue
sudo chown root -R *

echo "=== Bringing up development network ==="
# Install node modules (if necessary)
pushd smart_contract && npm install --unsafe-perm=true --allow-root
# Bring up `hardhat` development network
npx hardhat node &
HARDHAT_NETWORK_PID=$!

echo "=== Deploying smart contract on development network ==="
# This also compiles the contract.
CONTRACT_ACCOUNT=$(npx hardhat run scripts/deploy.js --network localhost)
popd

echo "=== Bringing up client server ==="    
CONTRACT_ACCOUNT=${CONTRACT_ACCOUNT} docker-compose up &
sleep 30
docker-compose down
kill $HARDHAT_NETWORK_PID
exit 0
