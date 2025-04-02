// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title ZetaVRF
 * @dev A simple implementation of a Verifiable Random Function for ZetaChain
 */
contract ZetaVRF {
    // Events
    event RandomNumberRequested(uint256 indexed requestId, address indexed requester);
    event RandomNumberGenerated(uint256 indexed requestId, uint256 randomNumber);

    // State variables
    uint256 public requestCounter;
    mapping(uint256 => RandomRequest) public requests;
    
    struct RandomRequest {
        address requester;
        uint256 blockNumber;
        bytes32 blockHash;
        uint256 randomNumber;
        bool fulfilled;
    }

    /**
     * @dev Request a new random number
     * @return requestId The ID of the random number request
     */
    function requestRandomNumber() external returns (uint256) {
        requestCounter++;
        
        // Store request details
        requests[requestCounter] = RandomRequest({
            requester: msg.sender,
            blockNumber: block.number + 1, // We'll use the next block for randomness
            blockHash: bytes32(0),
            randomNumber: 0,
            fulfilled: false
        });
        
        emit RandomNumberRequested(requestCounter, msg.sender);
        return requestCounter;
    }
    
    /**
     * @dev Fulfills a random number request
     * @param requestId The ID of the request to fulfill
     * @return randomNumber The generated random number
     */
    function fulfillRandomNumber(uint256 requestId) external returns (uint256) {
        RandomRequest storage request = requests[requestId];
        
        require(request.requester != address(0), "Request does not exist");
        require(!request.fulfilled, "Request already fulfilled");
        require(block.number > request.blockNumber, "Future block not yet mined");
        
        // Can only get blockhash for 256 most recent blocks
        require(block.number - request.blockNumber < 256, "Block too old");
        
        // Get the blockhash of the specified block
        bytes32 blockHash = blockhash(request.blockNumber);
        
        // Generate random number from blockHash, requestId, and requester address
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(
            blockHash, requestId, request.requester
        )));
        
        // Update request
        request.blockHash = blockHash;
        request.randomNumber = randomNumber;
        request.fulfilled = true;
        
        emit RandomNumberGenerated(requestId, randomNumber);
        return randomNumber;
    }
    
    /**
     * @dev Get the result of a fulfilled random number request
     * @param requestId The ID of the request
     * @return randomNumber The generated random number
     */
    function getRandomNumber(uint256 requestId) external view returns (uint256) {
        RandomRequest storage request = requests[requestId];
        require(request.fulfilled, "Request not fulfilled");
        return request.randomNumber;
    }
    
    /**
     * @dev Verify a random number was generated correctly
     * @param requestId The ID of the request
     * @param randomNumber The random number to verify
     * @return True if the random number matches the recorded value
     */
    function verifyRandomNumber(uint256 requestId, uint256 randomNumber) external view returns (bool) {
        RandomRequest storage request = requests[requestId];
        require(request.fulfilled, "Request not fulfilled");
        return request.randomNumber == randomNumber;
    }

    /**
     * @dev Generate a bounded random number in the range [min, max]
     * @param randomValue The original random value
     * @param min The minimum value (inclusive)
     * @param max The maximum value (inclusive)
     * @return A random number in the specified range
     */
    function boundedRandom(uint256 randomValue, uint256 min, uint256 max) public pure returns (uint256) {
        require(max >= min, "Max must be greater than or equal to min");
        uint256 range = max - min + 1;
        return min + (randomValue % range);
    }
    
    /**
     * @dev Get a random number in a specific range for a fulfilled request
     * @param requestId The ID of the request
     * @param min The minimum value (inclusive)
     * @param max The maximum value (inclusive)
     * @return A random number in the specified range
     */
    function getRandomNumberInRange(uint256 requestId, uint256 min, uint256 max) external view returns (uint256) {
        uint256 randomValue = this.getRandomNumber(requestId);
        return boundedRandom(randomValue, min, max);
    }
}
