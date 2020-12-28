# currency-codes-polish

JSON files and ES Modules containing ISO 4217 currency codes with Polish and English names. All data is scraped from [Wikipedia](https://pl.wikipedia.org/wiki/ISO_4217). Pseudo-currencies (precious metals, bond market units etc.) are omitted.

# Usage
```
npm install currency-codes-polish
```
```javascript
const currencyCodes = require('currency-codes-polish');

currencyCodes.find(({name_en}) => name_en === 'Pound sterling') =>

{
  alpha: 'GBP',
  numeric: '826',
  name_en: 'Pound sterling',
  name_pl: 'Funt szterling'
}

// both alpha and numeric codes are included as separate files as well
// in these files, the target code is set as the `code` property

// alpha

const currencyCodesAlpha = require('currency-codes-polish/alpha');

currencyCodesAlpha.find(({code}) => code === 'CZK') =>

{
  name_pl: 'Korona czeska',
  name_en: 'Czech koruna',
  code: 'CZK'
}

// numeric

const currencyCodesNum = require('currency-codes-polish/numeric');

currencyCodesNum.find(({code}) => code === '756') =>

{
  name_pl: 'Frank szwajcarski',
  name_en: 'Swiss franc',
  code: '756'
}
```
This package also includes ESM formatted files available as:
```javascript
import countryCodes from 'currency-codes-polish/esm';
import countryCodesAlpha from 'currency-codes-polish/esm/alpha';
import countryCodesNum from 'currency-codes-polish/esm/numeric';
```
# Scrape it yourself

1. Clone this repo
2. Run `npm install`
3. Run `npm run scrape`.