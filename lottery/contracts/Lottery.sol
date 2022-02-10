// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

contract Lottery {
    address public manager;
    address payable[] public players;

    constructor() {
        manager = msg.sender;
    }

    function enter() public payable { //might call function to send ether
        require(msg.value > .01 ether);
        players.push(payable(msg.sender)); //can use msg.data, msg.value, msg.gas, msg.sender
    }

    function random() private view returns (uint){ //not modifying state or data  
  return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players))); //components: block difficulty, block time, actual time

    } 

    function pickWinner() public restricted {
        uint index = random() % players.length;
        players[index].transfer(address(this).balance); //takes all money entered into lottery and sends to address
        players = new address payable[](0);
    }

    modifier restricted(){
        require(msg.sender == manager);
        _;
    }

    function getPlayers() public view returns (address payable[] memory) {
        return players;
    }

}
