/**
 * CSV Parsers for Cryptocurrency and Stock Exchanges
 *
 * Supported exchanges:
 * Crypto: Binance, Coinbase, Kraken, Crypto.com, Revolut
 * Stocks: Degiro, Trading212, Interactive Brokers, Revolut
 */

import { RawTransaction } from '../normalisers/types';

function parseCSV(csv: string): string[][] {
  return csv
    .trim()
    .split(/\r?\n/)
    .map((line) => line.split(',').map((cell) => cell.replace(/^"|"$/g, '').trim()));
}

/**
 * Binance CSV Parser
 * Format: User_ID,UTC_Time,Account,Operation,Coin,Change,Remark
 */
export function parseBinance(csv: string): RawTransaction[] {
  const rows = parseCSV(csv);
  const transactions: RawTransaction[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 7) continue;

    const [userId, utcTime, account, operation, coin, change, remark] = row;

    // Skip deposits/withdrawals for now, focus on trades
    if (operation === 'Buy' || operation === 'Sell' || operation === 'Transaction Related') {
      transactions.push({
        id: `binance_${userId}_${i}`,
        date: utcTime,
        description: `${operation} ${coin} - ${remark}`,
        amount: parseFloat(change),
        currency: coin,
        source: 'binance',
      });
    }
  }

  return transactions;
}

/**
 * Coinbase CSV Parser
 * Format: Timestamp,Transaction Type,Asset,Quantity Transacted,Spot Price Currency,Spot Price at Transaction,Subtotal,Total (inclusive of fees),Fees,Notes
 */
export function parseCoinbase(csv: string): RawTransaction[] {
  const rows = parseCSV(csv);
  const transactions: RawTransaction[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 10) continue;

    const [timestamp, txType, asset, quantity, spotPriceCurrency, spotPrice, subtotal, total, fees, notes] = row;

    transactions.push({
      id: `coinbase_${i}_${timestamp}`,
      date: timestamp,
      description: `${txType} ${asset} - ${notes}`,
      quantity: parseFloat(quantity),
      price: parseFloat(spotPrice),
      amount: parseFloat(total),
      costBasis: parseFloat(subtotal),
      currency: spotPriceCurrency || 'EUR',
      source: 'coinbase',
    });
  }

  return transactions;
}

/**
 * Kraken CSV Parser
 * Format: txid,refid,time,type,subtype,aclass,asset,amount,fee,balance
 */
export function parseKraken(csv: string): RawTransaction[] {
  const rows = parseCSV(csv);
  const transactions: RawTransaction[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 10) continue;

    const [txid, refid, time, type, subtype, aclass, asset, amount, fee, balance] = row;

    if (type === 'trade') {
      transactions.push({
        id: txid,
        date: time,
        description: `${type} ${subtype} ${asset}`,
        amount: parseFloat(amount),
        currency: asset,
        source: 'kraken',
      });
    }
  }

  return transactions;
}

/**
 * Crypto.com CSV Parser
 * Format: Timestamp (UTC),Transaction Description,Currency,Amount,To Currency,To Amount,Native Currency,Native Amount,Native Amount (in USD),Transaction Kind
 */
export function parseCryptoCom(csv: string): RawTransaction[] {
  const rows = parseCSV(csv);
  const transactions: RawTransaction[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 10) continue;

    const [timestamp, description, currency, amount, toCurrency, toAmount, nativeCurrency, nativeAmount, nativeUSD, kind] = row;

    // Handle crypto trades
    if (kind === 'crypto_purchase' || kind === 'crypto_exchange') {
      transactions.push({
        id: `cryptocom_${i}_${timestamp}`,
        date: timestamp,
        description: `${kind} - ${description}`,
        quantity: parseFloat(toAmount),
        amount: parseFloat(nativeAmount),
        currency: toCurrency,
        source: 'crypto.com',
      });
    }
  }

  return transactions;
}

/**
 * Revolut CSV Parser (Enhanced for Crypto + Stocks)
 * Format: Type,Product,Started Date,Completed Date,Description,Amount,Fee,Currency,State,Balance
 */
export function parseRevolutEnhanced(csv: string): RawTransaction[] {
  const rows = parseCSV(csv);
  const transactions: RawTransaction[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 10) continue;

    const [type, product, startedDate, completedDate, description, amount, fee, currency, state, balance] = row;

    // Handle crypto and stock trades
    if (type === 'EXCHANGE' || type === 'CARD_PAYMENT' || product === 'Crypto' || product === 'Stocks') {
      transactions.push({
        id: `revolut_${i}_${completedDate}`,
        date: completedDate || startedDate,
        description: `${product} - ${description}`,
        amount: parseFloat(amount),
        currency: currency || 'EUR',
        source: 'revolut',
      });
    }
  }

  return transactions;
}

/**
 * Trading212 CSV Parser
 * Format: Action,Time,ISIN,Ticker,Name,No. of shares,Price / share,Currency (Price / share),Exchange rate,Total,Currency (Total),Withholding tax,Currency (Withholding tax),Charge amount,Currency (Charge amount),Stamp duty reserve tax,Currency (Stamp duty reserve tax),Notes,ID,Currency conversion fee,Currency (Currency conversion fee)
 */
export function parseTrading212(csv: string): RawTransaction[] {
  const rows = parseCSV(csv);
  const transactions: RawTransaction[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 20) continue;

    const [action, time, isin, ticker, name, shares, pricePerShare, priceCurrency, exchangeRate, total, totalCurrency] = row;

    if (action === 'Market buy' || action === 'Market sell') {
      transactions.push({
        id: `trading212_${i}_${time}`,
        date: time,
        description: `${action} ${ticker} (${name})`,
        quantity: parseFloat(shares),
        price: parseFloat(pricePerShare),
        amount: parseFloat(total),
        currency: totalCurrency || priceCurrency || 'EUR',
        source: 'trading212',
      });
    }
  }

  return transactions;
}

/**
 * Interactive Brokers CSV Parser
 * Format: Trades,Header,DataDiscriminator,Asset Category,Currency,Symbol,Date/Time,Quantity,T. Price,C. Price,Proceeds,Comm/Fee,Basis,Realized P/L,MTM P/L,Code
 */
export function parseInteractiveBrokers(csv: string): RawTransaction[] {
  const rows = parseCSV(csv);
  const transactions: RawTransaction[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row[0] !== 'Trades' || row[2] !== 'Order') continue;

    const [_, header, discriminator, assetCategory, currency, symbol, dateTime, quantity, tradePrice, closePrice, proceeds, commFee, basis, realizedPL] = row;

    transactions.push({
      id: `ibkr_${i}_${dateTime}`,
      date: dateTime,
      description: `Trade ${symbol} (${assetCategory})`,
      quantity: parseFloat(quantity),
      price: parseFloat(tradePrice),
      amount: parseFloat(proceeds),
      costBasis: parseFloat(basis),
      currency: currency || 'EUR',
      source: 'ibkr',
    });
  }

  return transactions;
}

/**
 * Degiro CSV Parser (Enhanced)
 * Format: Date,Time,Product,ISIN,Description,FX,Change,Balance,Order Id
 */
export function parseDegiroEnhanced(csv: string): RawTransaction[] {
  const rows = parseCSV(csv);
  const transactions: RawTransaction[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 9) continue;

    const [date, time, product, isin, description, fx, change, balance, orderId] = row;

    // Parse stock/ETF trades
    if (description.includes('Buy') || description.includes('Sell')) {
      transactions.push({
        id: `degiro_${orderId || i}`,
        date: `${date} ${time}`,
        description: `${description} ${product}`,
        amount: parseFloat(change),
        currency: fx || 'EUR',
        source: 'degiro',
      });
    }
  }

  return transactions;
}

/**
 * Universal CSV parser that auto-detects exchange
 */
export function parseExchangeCSV(csv: string, source?: string): RawTransaction[] {
  const header = csv.split(/\r?\n/)[0].toLowerCase();

  // Auto-detect if source not provided
  if (!source) {
    if (header.includes('binance') || header.includes('user_id')) source = 'binance';
    else if (header.includes('coinbase')) source = 'coinbase';
    else if (header.includes('kraken') || header.includes('txid')) source = 'kraken';
    else if (header.includes('crypto.com')) source = 'cryptocom';
    else if (header.includes('trading212')) source = 'trading212';
    else if (header.includes('interactive brokers') || header.includes('ibkr')) source = 'ibkr';
    else if (header.includes('degiro')) source = 'degiro';
    else if (header.includes('revolut')) source = 'revolut';
  }

  switch (source) {
    case 'binance':
      return parseBinance(csv);
    case 'coinbase':
      return parseCoinbase(csv);
    case 'kraken':
      return parseKraken(csv);
    case 'cryptocom':
      return parseCryptoCom(csv);
    case 'revolut':
      return parseRevolutEnhanced(csv);
    case 'trading212':
      return parseTrading212(csv);
    case 'ibkr':
      return parseInteractiveBrokers(csv);
    case 'degiro':
      return parseDegiroEnhanced(csv);
    default:
      throw new Error(`Unsupported exchange: ${source}`);
  }
}

/**
 * Supported exchanges list
 */
export const SUPPORTED_EXCHANGES = {
  crypto: ['binance', 'coinbase', 'kraken', 'crypto.com', 'revolut'],
  stocks: ['degiro', 'trading212', 'ibkr', 'revolut'],
} as const;
