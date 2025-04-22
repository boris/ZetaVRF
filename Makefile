# Default values for range parameters
MIN ?= 0
MAX ?= 100
ADDRESS ?= 0xYourAddressHere

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

.PHONY: faucet
faucet: ## Drip 3 ZETA testnet tokens to the desired address every 24h. (Requires Github login).
	@echo "Dripping 3 ZETA testnet tokens to $(ADDRESS)"
	npx zetafaucet --drip --address $(ADDRESS)

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(firstword $(MAKEFILE_LIST)) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

