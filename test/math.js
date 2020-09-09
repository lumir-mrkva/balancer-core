const truffleAssert = require('truffle-assertions');
const fs = require('fs');
const TMath = artifacts.require('TMath');

contract('math-tester', async () => {
  const MAX = web3.utils.toTwosComplement(-1);

  let tmath, cases;

  before(async () => {
    tmath = await TMath.deployed();
    cases = fs.readFileSync(process.env.TEST_CASES || __dirname + '/../../math-tester/data/testdata.txt')
      .toString()
      .split('\n')
      .map(line => line.split(','))
      .filter(params => params.length >= 5);
  });

  it('sell', async () => {
    let i = 1;
    const outputs = [];
    for (let input of cases) {
      console.log('Test:', i++);
      console.log('Case:', input);
      const [tokenBalanceIn, tokenBalanceOut, tokenAmountIn, tokenWeightIn, tokenWeightOut, swapFee = 0] = input;
      let output, gas;
      try {
        gas = await tmath.methods['measureCalcOutGivenIn(uint256,uint256,uint256,uint256,uint256,uint256)']
          .estimateGas(
            tokenBalanceIn,
            tokenWeightIn,
            tokenBalanceOut,
            tokenWeightOut,
            tokenAmountIn,
            swapFee
          );
        console.log('Gas:', gas);
        output = await tmath.calcOutGivenIn(
          tokenBalanceIn,
          tokenWeightIn,
          tokenBalanceOut,
          tokenWeightOut,
          tokenAmountIn,
          swapFee
        );
        output = output.toString();
        console.log(output);
      } catch (e) {
        output = e.message;
        console.error(e.message);
      }
      outputs.push({ case: i, input, output });
      console.log('');
    }
  });
});
