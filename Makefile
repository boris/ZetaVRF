# Default values for range parameters
MIN ?= 0
MAX ?= 100

.PHONY: setup
setup: ## Setup the project
	npm init -y
	npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv

.PHONY:
init: ## Initialize the Hardhat project
	npx hardhat init

.PHONY: compile
compile: ## Compile the contracts
	npx hardhat compile

.PHONY: deploy
deploy: ## Deploy the contract to ZetaChain testnet
	npx hardhat run scripts/deploy.js --network zetachainTestnet

.PHONY: test
test: ## Run tests
	npx hardhat test

.PHONY: random
random: ## Request a random number (defaults: MIN=0, MAX=100)
	MIN=$(MIN) MAX=$(MAX) npx hardhat run scripts/interact.js --network zetachainTestnet

.PHONY: clean
clean: ## Clean build artifacts
	npx hardhat clean
	rm -rf node_modules

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(firstword $(MAKEFILE_LIST)) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

