// PG8M3T6D787FYMS1

var stocks = new Stocks('PG8M3T6D787FYMS1'); // replace XXXX with your API Key


async function stockData() {
    var stockName = document.getElementById('stockName').value;

    var result = await stocks.timeSeries({
        symbol: stockName,
        interval: 'daily',
        amount: 1
    });

    var textBox = document.getElementById('stockText');
    textBox.value = JSON.stringify(result);
}

stockData();