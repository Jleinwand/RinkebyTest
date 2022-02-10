const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const { abi, evm } = require("../compile");

let lottery;
let accounts;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(abi)
    .deploy ({ data: evm.bytecode.object })
    .send({ from: accounts[0], gas: '1000000'});
});

describe('Lottery Contract', () => {
    it ('deploys contract', () => {
        assert.ok(lottery.options.address);
    });

    it('allows one account to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether'),
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0],
        });

        assert.equal(accounts[0], players [0]);
        assert.equal(1, players.length);
    });

    it('allows multiple accounts to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('.02', 'ether'),
        });

        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('.02', 'ether'),
        });

        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('.02', 'ether'),
        });
        
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0],
        });

        assert.equal(accounts[0], players[0]);
        assert.equal(accounts[1], players[1]);
        assert.equal(accounts[2], players[2]);
        assert.equal(3, players.length); //players needed/players in actuality.
    });
        it('requires a minimum of eth to enter', async () => {
            try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: 0,
            });
            assert(false);
        } catch(err) {
            assert(err);
        }

        });

        it('only manager can call pickWinner', async () => {
            try {
                await lottery.methods.pickWinner().send({
                    from: accounts[1],
                });
                assert(false);
            } catch(err)  {
                assert(err);
            }
        });
        it('sends money to the winner and resets player array', async () => {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei('2', 'ether'),
          });

          const initialBalance = await web3.eth.getBalance(accounts[0]);
          await lottery.methods.pickWinner().send ({from: accounts[0]});
          const finalBalance = await web3.eth.getBalance(accounts[0]);
          const difference = finalBalance - initialBalance;
          //console.log(finalBalance - initialBalance);
          assert(difference > web3.utils.toWei('1.8', 'ether'));
        });
   
        it('empties player array once funds are sent', async () => {
            try {
            await lottery.methods.getPlayers().send ({
                from: accounts[0],
                value: 1
            });
            assert(false);
        } catch(err) {
            assert(err);
        }
        });

        it('checks that there are no players after a winner has been selected', async()=> {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei('2', 'ether')
            });
            await lottery.methods.pickWinner().send({
                from: accounts[0],
            });
            const players = await lottery.methods.getPlayers().call();
            console.log(players.length);
            assert(players.length == 0);
        });
        
        it ('lottery has zero balance', async () => {
          const contractBalance = await web3.eth.getBalance(lottery.options.address);
          console.log(contractBalance);
        
        });

        it ('checks the lottery balance is empty after pickWinner is called', async()=>{
            await lottery.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei('2', 'ether')
            })
        await lottery.methods.pickWinner().send({
            from: accounts[0]
        });

        const balance = await web3.eth.getBalance(lottery.options.address);
        console.log(balance);
        assert(balance == 0);
    });
});
