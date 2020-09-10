const truffleAssert = require('truffle-assertions');
const { calcOutGivenIn, calcInGivenOut, calcRelativeDiff } = require('../lib/calc_comparisons');
const fs = require('fs');
const TMath = artifacts.require('TMath');

contract('math-tester', async () => {
  const MAX = web3.utils.toTwosComplement(-1);
  const { fromWei, toWei, toBN } = web3.utils;

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
      const params = [tokenBalanceIn, tokenWeightIn, tokenBalanceOut, tokenWeightOut, tokenAmountIn, swapFee];
      const expected = Math.round(calcOutGivenIn(...params.map(n => Number(fromWei(n)))) * 10**18);
      console.log('Expected:', expected);
      let output, gas;
      try {
        gas = await tmath
          .methods['measureCalcOutGivenIn(uint256,uint256,uint256,uint256,uint256,uint256)']
          .estimateGas(...params);
        output = await tmath.calcOutGivenIn(...params);
        output = output.toNumber();
        console.log('Output:  ', output);
        const diff = toBN(expected).sub(toBN(output)).toNumber();
        if (diff !== 0) {
          console.log('Diff:', diff);
        }
        console.log('Gas:', gas);
      } catch (e) {
        output = e.message;
        console.error(e.message);
      }
      outputs.push({ case: i, input, output });
      console.log('');
    }
  });
});
