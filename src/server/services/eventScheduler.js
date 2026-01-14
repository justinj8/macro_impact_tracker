import { EventEmitter } from 'events';

// Economic calendar with upcoming events - Updated January 2026
const SCHEDULED_EVENTS = [
  // ============ JANUARY 2026 ============
  {
    indicator: 'PMI',
    name: 'ISM Manufacturing PMI (Dec)',
    date: '2026-01-05T10:00:00',
    forecast: 49.5,
    previous: 49.2,
    importance: 'medium'
  },
  {
    indicator: 'PMI',
    name: 'ISM Services PMI (Dec)',
    date: '2026-01-07T10:00:00',
    forecast: 53.5,
    previous: 52.1,
    importance: 'medium'
  },
  {
    indicator: 'CLAIMS',
    name: 'Initial Jobless Claims',
    date: '2026-01-08T08:30:00',
    forecast: 212,
    previous: 208,
    importance: 'medium'
  },
  {
    indicator: 'NFP',
    name: 'Non-Farm Payrolls (Dec)',
    date: '2026-01-09T08:30:00',
    forecast: 195,
    previous: 227,
    importance: 'high'
  },
  {
    indicator: 'CPI',
    name: 'CPI YoY (Dec)',
    date: '2026-01-13T08:30:00',
    forecast: 2.5,
    previous: 2.7,
    importance: 'high'
  },
  {
    indicator: 'PPI',
    name: 'PPI MoM (Dec)',
    date: '2026-01-14T08:30:00',
    forecast: 0.2,
    previous: 0.4,
    importance: 'medium'
  },
  {
    indicator: 'CLAIMS',
    name: 'Initial Jobless Claims',
    date: '2026-01-15T08:30:00',
    forecast: 215,
    previous: 211,
    importance: 'medium'
  },
  {
    indicator: 'RETAIL',
    name: 'Advance Retail Sales (Dec)',
    date: '2026-01-16T08:30:00',
    forecast: 0.5,
    previous: 0.7,
    importance: 'medium'
  },
  {
    indicator: 'CLAIMS',
    name: 'Initial Jobless Claims',
    date: '2026-01-22T08:30:00',
    forecast: 218,
    previous: 215,
    importance: 'medium'
  },
  {
    indicator: 'FOMC',
    name: 'FOMC Rate Decision (Jan)',
    date: '2026-01-28T14:00:00',
    forecast: 4.25,
    previous: 4.50,
    importance: 'critical'
  },
  {
    indicator: 'GDP',
    name: 'GDP QoQ Advance (Q4 2025)',
    date: '2026-01-29T08:30:00',
    forecast: 2.2,
    previous: 2.8,
    importance: 'high'
  },
  {
    indicator: 'PCE',
    name: 'Core PCE Price Index YoY (Dec)',
    date: '2026-01-29T08:30:00',
    forecast: 2.6,
    previous: 2.8,
    importance: 'high'
  },
  {
    indicator: 'CLAIMS',
    name: 'Initial Jobless Claims',
    date: '2026-01-29T08:30:00',
    forecast: 220,
    previous: 218,
    importance: 'medium'
  },

  // ============ FEBRUARY 2026 ============
  {
    indicator: 'PMI',
    name: 'ISM Manufacturing PMI (Jan)',
    date: '2026-02-02T10:00:00',
    forecast: 49.8,
    previous: 49.5,
    importance: 'medium'
  },
  {
    indicator: 'PMI',
    name: 'ISM Services PMI (Jan)',
    date: '2026-02-04T10:00:00',
    forecast: 54.0,
    previous: 53.5,
    importance: 'medium'
  },
  {
    indicator: 'CLAIMS',
    name: 'Initial Jobless Claims',
    date: '2026-02-05T08:30:00',
    forecast: 218,
    previous: 220,
    importance: 'medium'
  },
  {
    indicator: 'NFP',
    name: 'Non-Farm Payrolls (Jan)',
    date: '2026-02-06T08:30:00',
    forecast: 185,
    previous: 212,
    importance: 'high'
  },
  {
    indicator: 'CPI',
    name: 'CPI YoY (Jan)',
    date: '2026-02-11T08:30:00',
    forecast: 2.4,
    previous: 2.5,
    importance: 'high'
  },
  {
    indicator: 'PPI',
    name: 'PPI MoM (Jan)',
    date: '2026-02-12T08:30:00',
    forecast: 0.2,
    previous: 0.2,
    importance: 'medium'
  },
  {
    indicator: 'RETAIL',
    name: 'Advance Retail Sales (Jan)',
    date: '2026-02-17T08:30:00',
    forecast: 0.3,
    previous: 0.5,
    importance: 'medium'
  },
  {
    indicator: 'PCE',
    name: 'Core PCE Price Index YoY (Jan)',
    date: '2026-02-26T08:30:00',
    forecast: 2.5,
    previous: 2.6,
    importance: 'high'
  },

  // ============ MARCH 2026 ============
  {
    indicator: 'PMI',
    name: 'ISM Services PMI (Feb)',
    date: '2026-03-04T10:00:00',
    forecast: 54.5,
    previous: 54.0,
    importance: 'medium'
  },
  {
    indicator: 'PMI',
    name: 'ISM Manufacturing PMI (Feb)',
    date: '2026-03-02T10:00:00',
    forecast: 50.2,
    previous: 49.8,
    importance: 'medium'
  },
  {
    indicator: 'NFP',
    name: 'Non-Farm Payrolls (Feb)',
    date: '2026-03-06T08:30:00',
    forecast: 175,
    previous: 185,
    importance: 'high'
  },
  {
    indicator: 'CPI',
    name: 'CPI YoY (Feb)',
    date: '2026-03-11T08:30:00',
    forecast: 2.3,
    previous: 2.4,
    importance: 'high'
  },
  {
    indicator: 'PPI',
    name: 'PPI MoM (Feb)',
    date: '2026-03-12T08:30:00',
    forecast: 0.3,
    previous: 0.2,
    importance: 'medium'
  },
  {
    indicator: 'RETAIL',
    name: 'Advance Retail Sales (Feb)',
    date: '2026-03-16T08:30:00',
    forecast: 0.4,
    previous: 0.3,
    importance: 'medium'
  },
  {
    indicator: 'FOMC',
    name: 'FOMC Rate Decision (Mar)',
    date: '2026-03-18T14:00:00',
    forecast: 4.00,
    previous: 4.25,
    importance: 'critical'
  },
  {
    indicator: 'GDP',
    name: 'GDP QoQ Third Estimate (Q4 2025)',
    date: '2026-03-26T08:30:00',
    forecast: 2.3,
    previous: 2.2,
    importance: 'high'
  },
  {
    indicator: 'PCE',
    name: 'Core PCE Price Index YoY (Feb)',
    date: '2026-03-26T08:30:00',
    forecast: 2.4,
    previous: 2.5,
    importance: 'high'
  },

  // ============ APRIL 2026 ============
  {
    indicator: 'PMI',
    name: 'ISM Manufacturing PMI (Mar)',
    date: '2026-04-01T10:00:00',
    forecast: 50.5,
    previous: 50.2,
    importance: 'medium'
  },
  {
    indicator: 'NFP',
    name: 'Non-Farm Payrolls (Mar)',
    date: '2026-04-03T08:30:00',
    forecast: 190,
    previous: 175,
    importance: 'high'
  },
  {
    indicator: 'PMI',
    name: 'ISM Services PMI (Mar)',
    date: '2026-04-06T10:00:00',
    forecast: 55.0,
    previous: 54.5,
    importance: 'medium'
  },
  {
    indicator: 'CPI',
    name: 'CPI YoY (Mar)',
    date: '2026-04-14T08:30:00',
    forecast: 2.2,
    previous: 2.3,
    importance: 'high'
  },
  {
    indicator: 'PPI',
    name: 'PPI MoM (Mar)',
    date: '2026-04-15T08:30:00',
    forecast: 0.2,
    previous: 0.3,
    importance: 'medium'
  },
  {
    indicator: 'RETAIL',
    name: 'Advance Retail Sales (Mar)',
    date: '2026-04-16T08:30:00',
    forecast: 0.5,
    previous: 0.4,
    importance: 'medium'
  },
  {
    indicator: 'FOMC',
    name: 'FOMC Rate Decision (Apr)',
    date: '2026-04-29T14:00:00',
    forecast: 3.75,
    previous: 4.00,
    importance: 'critical'
  },
  {
    indicator: 'GDP',
    name: 'GDP QoQ Advance (Q1 2026)',
    date: '2026-04-29T08:30:00',
    forecast: 2.0,
    previous: 2.3,
    importance: 'high'
  },
  {
    indicator: 'PCE',
    name: 'Core PCE Price Index YoY (Mar)',
    date: '2026-04-30T08:30:00',
    forecast: 2.3,
    previous: 2.4,
    importance: 'high'
  },

  // ============ MAY 2026 ============
  {
    indicator: 'PMI',
    name: 'ISM Manufacturing PMI (Apr)',
    date: '2026-05-01T10:00:00',
    forecast: 50.8,
    previous: 50.5,
    importance: 'medium'
  },
  {
    indicator: 'PMI',
    name: 'ISM Services PMI (Apr)',
    date: '2026-05-05T10:00:00',
    forecast: 55.2,
    previous: 55.0,
    importance: 'medium'
  },
  {
    indicator: 'NFP',
    name: 'Non-Farm Payrolls (Apr)',
    date: '2026-05-08T08:30:00',
    forecast: 180,
    previous: 190,
    importance: 'high'
  },
  {
    indicator: 'CPI',
    name: 'CPI YoY (Apr)',
    date: '2026-05-12T08:30:00',
    forecast: 2.1,
    previous: 2.2,
    importance: 'high'
  },
  {
    indicator: 'PPI',
    name: 'PPI MoM (Apr)',
    date: '2026-05-13T08:30:00',
    forecast: 0.2,
    previous: 0.2,
    importance: 'medium'
  },
  {
    indicator: 'RETAIL',
    name: 'Advance Retail Sales (Apr)',
    date: '2026-05-15T08:30:00',
    forecast: 0.4,
    previous: 0.5,
    importance: 'medium'
  },
  {
    indicator: 'PCE',
    name: 'Core PCE Price Index YoY (Apr)',
    date: '2026-05-28T08:30:00',
    forecast: 2.3,
    previous: 2.3,
    importance: 'high'
  },

  // ============ JUNE 2026 ============
  {
    indicator: 'PMI',
    name: 'ISM Manufacturing PMI (May)',
    date: '2026-06-01T10:00:00',
    forecast: 51.0,
    previous: 50.8,
    importance: 'medium'
  },
  {
    indicator: 'PMI',
    name: 'ISM Services PMI (May)',
    date: '2026-06-03T10:00:00',
    forecast: 55.5,
    previous: 55.2,
    importance: 'medium'
  },
  {
    indicator: 'NFP',
    name: 'Non-Farm Payrolls (May)',
    date: '2026-06-05T08:30:00',
    forecast: 170,
    previous: 180,
    importance: 'high'
  },
  {
    indicator: 'CPI',
    name: 'CPI YoY (May)',
    date: '2026-06-10T08:30:00',
    forecast: 2.0,
    previous: 2.1,
    importance: 'high'
  },
  {
    indicator: 'PPI',
    name: 'PPI MoM (May)',
    date: '2026-06-11T08:30:00',
    forecast: 0.1,
    previous: 0.2,
    importance: 'medium'
  },
  {
    indicator: 'RETAIL',
    name: 'Advance Retail Sales (May)',
    date: '2026-06-16T08:30:00',
    forecast: 0.3,
    previous: 0.4,
    importance: 'medium'
  },
  {
    indicator: 'FOMC',
    name: 'FOMC Rate Decision (Jun)',
    date: '2026-06-17T14:00:00',
    forecast: 3.50,
    previous: 3.75,
    importance: 'critical'
  },
  {
    indicator: 'GDP',
    name: 'GDP QoQ Third Estimate (Q1 2026)',
    date: '2026-06-25T08:30:00',
    forecast: 2.1,
    previous: 2.0,
    importance: 'high'
  },
  {
    indicator: 'PCE',
    name: 'Core PCE Price Index YoY (May)',
    date: '2026-06-25T08:30:00',
    forecast: 2.2,
    previous: 2.3,
    importance: 'high'
  },

  // ============ JULY 2026 ============
  {
    indicator: 'PMI',
    name: 'ISM Manufacturing PMI (Jun)',
    date: '2026-07-01T10:00:00',
    forecast: 51.2,
    previous: 51.0,
    importance: 'medium'
  },
  {
    indicator: 'NFP',
    name: 'Non-Farm Payrolls (Jun)',
    date: '2026-07-02T08:30:00',
    forecast: 165,
    previous: 170,
    importance: 'high'
  },
  {
    indicator: 'PMI',
    name: 'ISM Services PMI (Jun)',
    date: '2026-07-06T10:00:00',
    forecast: 55.8,
    previous: 55.5,
    importance: 'medium'
  },
  {
    indicator: 'CPI',
    name: 'CPI YoY (Jun)',
    date: '2026-07-14T08:30:00',
    forecast: 2.0,
    previous: 2.0,
    importance: 'high'
  },
  {
    indicator: 'PPI',
    name: 'PPI MoM (Jun)',
    date: '2026-07-15T08:30:00',
    forecast: 0.1,
    previous: 0.1,
    importance: 'medium'
  },
  {
    indicator: 'RETAIL',
    name: 'Advance Retail Sales (Jun)',
    date: '2026-07-16T08:30:00',
    forecast: 0.4,
    previous: 0.3,
    importance: 'medium'
  },
  {
    indicator: 'FOMC',
    name: 'FOMC Rate Decision (Jul)',
    date: '2026-07-29T14:00:00',
    forecast: 3.50,
    previous: 3.50,
    importance: 'critical'
  },
  {
    indicator: 'GDP',
    name: 'GDP QoQ Advance (Q2 2026)',
    date: '2026-07-30T08:30:00',
    forecast: 2.4,
    previous: 2.1,
    importance: 'high'
  },
  {
    indicator: 'PCE',
    name: 'Core PCE Price Index YoY (Jun)',
    date: '2026-07-30T08:30:00',
    forecast: 2.1,
    previous: 2.2,
    importance: 'high'
  },

  // ============ AUGUST 2026 ============
  {
    indicator: 'PMI',
    name: 'ISM Manufacturing PMI (Jul)',
    date: '2026-08-03T10:00:00',
    forecast: 51.5,
    previous: 51.2,
    importance: 'medium'
  },
  {
    indicator: 'PMI',
    name: 'ISM Services PMI (Jul)',
    date: '2026-08-05T10:00:00',
    forecast: 56.0,
    previous: 55.8,
    importance: 'medium'
  },
  {
    indicator: 'NFP',
    name: 'Non-Farm Payrolls (Jul)',
    date: '2026-08-07T08:30:00',
    forecast: 175,
    previous: 165,
    importance: 'high'
  },
  {
    indicator: 'CPI',
    name: 'CPI YoY (Jul)',
    date: '2026-08-12T08:30:00',
    forecast: 2.0,
    previous: 2.0,
    importance: 'high'
  },
  {
    indicator: 'PPI',
    name: 'PPI MoM (Jul)',
    date: '2026-08-13T08:30:00',
    forecast: 0.1,
    previous: 0.1,
    importance: 'medium'
  },
  {
    indicator: 'RETAIL',
    name: 'Advance Retail Sales (Jul)',
    date: '2026-08-14T08:30:00',
    forecast: 0.4,
    previous: 0.4,
    importance: 'medium'
  },
  {
    indicator: 'PCE',
    name: 'Core PCE Price Index YoY (Jul)',
    date: '2026-08-27T08:30:00',
    forecast: 2.0,
    previous: 2.1,
    importance: 'high'
  },

  // ============ SEPTEMBER 2026 ============
  {
    indicator: 'PMI',
    name: 'ISM Manufacturing PMI (Aug)',
    date: '2026-09-01T10:00:00',
    forecast: 51.8,
    previous: 51.5,
    importance: 'medium'
  },
  {
    indicator: 'PMI',
    name: 'ISM Services PMI (Aug)',
    date: '2026-09-03T10:00:00',
    forecast: 56.2,
    previous: 56.0,
    importance: 'medium'
  },
  {
    indicator: 'NFP',
    name: 'Non-Farm Payrolls (Aug)',
    date: '2026-09-04T08:30:00',
    forecast: 180,
    previous: 175,
    importance: 'high'
  },
  {
    indicator: 'CPI',
    name: 'CPI YoY (Aug)',
    date: '2026-09-15T08:30:00',
    forecast: 2.0,
    previous: 2.0,
    importance: 'high'
  },
  {
    indicator: 'PPI',
    name: 'PPI MoM (Aug)',
    date: '2026-09-16T08:30:00',
    forecast: 0.1,
    previous: 0.1,
    importance: 'medium'
  },
  {
    indicator: 'FOMC',
    name: 'FOMC Rate Decision (Sep)',
    date: '2026-09-16T14:00:00',
    forecast: 3.25,
    previous: 3.50,
    importance: 'critical'
  },
  {
    indicator: 'RETAIL',
    name: 'Advance Retail Sales (Aug)',
    date: '2026-09-17T08:30:00',
    forecast: 0.3,
    previous: 0.4,
    importance: 'medium'
  },
  {
    indicator: 'GDP',
    name: 'GDP QoQ Third Estimate (Q2 2026)',
    date: '2026-09-24T08:30:00',
    forecast: 2.5,
    previous: 2.4,
    importance: 'high'
  },
  {
    indicator: 'PCE',
    name: 'Core PCE Price Index YoY (Aug)',
    date: '2026-09-25T08:30:00',
    forecast: 2.0,
    previous: 2.0,
    importance: 'high'
  },

  // ============ OCTOBER 2026 ============
  {
    indicator: 'PMI',
    name: 'ISM Manufacturing PMI (Sep)',
    date: '2026-10-01T10:00:00',
    forecast: 52.0,
    previous: 51.8,
    importance: 'medium'
  },
  {
    indicator: 'NFP',
    name: 'Non-Farm Payrolls (Sep)',
    date: '2026-10-02T08:30:00',
    forecast: 185,
    previous: 180,
    importance: 'high'
  },
  {
    indicator: 'PMI',
    name: 'ISM Services PMI (Sep)',
    date: '2026-10-05T10:00:00',
    forecast: 56.5,
    previous: 56.2,
    importance: 'medium'
  },
  {
    indicator: 'CPI',
    name: 'CPI YoY (Sep)',
    date: '2026-10-13T08:30:00',
    forecast: 2.0,
    previous: 2.0,
    importance: 'high'
  },
  {
    indicator: 'PPI',
    name: 'PPI MoM (Sep)',
    date: '2026-10-14T08:30:00',
    forecast: 0.2,
    previous: 0.1,
    importance: 'medium'
  },
  {
    indicator: 'RETAIL',
    name: 'Advance Retail Sales (Sep)',
    date: '2026-10-16T08:30:00',
    forecast: 0.4,
    previous: 0.3,
    importance: 'medium'
  },
  {
    indicator: 'FOMC',
    name: 'FOMC Rate Decision (Oct)',
    date: '2026-10-28T14:00:00',
    forecast: 3.25,
    previous: 3.25,
    importance: 'critical'
  },
  {
    indicator: 'GDP',
    name: 'GDP QoQ Advance (Q3 2026)',
    date: '2026-10-29T08:30:00',
    forecast: 2.6,
    previous: 2.5,
    importance: 'high'
  },
  {
    indicator: 'PCE',
    name: 'Core PCE Price Index YoY (Sep)',
    date: '2026-10-30T08:30:00',
    forecast: 2.0,
    previous: 2.0,
    importance: 'high'
  },

  // ============ NOVEMBER 2026 ============
  {
    indicator: 'PMI',
    name: 'ISM Manufacturing PMI (Oct)',
    date: '2026-11-02T10:00:00',
    forecast: 52.2,
    previous: 52.0,
    importance: 'medium'
  },
  {
    indicator: 'PMI',
    name: 'ISM Services PMI (Oct)',
    date: '2026-11-04T10:00:00',
    forecast: 56.8,
    previous: 56.5,
    importance: 'medium'
  },
  {
    indicator: 'NFP',
    name: 'Non-Farm Payrolls (Oct)',
    date: '2026-11-06T08:30:00',
    forecast: 190,
    previous: 185,
    importance: 'high'
  },
  {
    indicator: 'CPI',
    name: 'CPI YoY (Oct)',
    date: '2026-11-12T08:30:00',
    forecast: 2.0,
    previous: 2.0,
    importance: 'high'
  },
  {
    indicator: 'PPI',
    name: 'PPI MoM (Oct)',
    date: '2026-11-13T08:30:00',
    forecast: 0.2,
    previous: 0.2,
    importance: 'medium'
  },
  {
    indicator: 'RETAIL',
    name: 'Advance Retail Sales (Oct)',
    date: '2026-11-17T08:30:00',
    forecast: 0.5,
    previous: 0.4,
    importance: 'medium'
  },
  {
    indicator: 'PCE',
    name: 'Core PCE Price Index YoY (Oct)',
    date: '2026-11-25T08:30:00',
    forecast: 2.0,
    previous: 2.0,
    importance: 'high'
  },

  // ============ DECEMBER 2026 ============
  {
    indicator: 'PMI',
    name: 'ISM Manufacturing PMI (Nov)',
    date: '2026-12-01T10:00:00',
    forecast: 52.5,
    previous: 52.2,
    importance: 'medium'
  },
  {
    indicator: 'PMI',
    name: 'ISM Services PMI (Nov)',
    date: '2026-12-03T10:00:00',
    forecast: 57.0,
    previous: 56.8,
    importance: 'medium'
  },
  {
    indicator: 'NFP',
    name: 'Non-Farm Payrolls (Nov)',
    date: '2026-12-04T08:30:00',
    forecast: 195,
    previous: 190,
    importance: 'high'
  },
  {
    indicator: 'FOMC',
    name: 'FOMC Rate Decision (Dec)',
    date: '2026-12-09T14:00:00',
    forecast: 3.00,
    previous: 3.25,
    importance: 'critical'
  },
  {
    indicator: 'CPI',
    name: 'CPI YoY (Nov)',
    date: '2026-12-10T08:30:00',
    forecast: 2.0,
    previous: 2.0,
    importance: 'high'
  },
  {
    indicator: 'PPI',
    name: 'PPI MoM (Nov)',
    date: '2026-12-11T08:30:00',
    forecast: 0.2,
    previous: 0.2,
    importance: 'medium'
  },
  {
    indicator: 'RETAIL',
    name: 'Advance Retail Sales (Nov)',
    date: '2026-12-15T08:30:00',
    forecast: 0.6,
    previous: 0.5,
    importance: 'medium'
  },
  {
    indicator: 'PCE',
    name: 'Core PCE Price Index YoY (Nov)',
    date: '2026-12-23T08:30:00',
    forecast: 2.0,
    previous: 2.0,
    importance: 'high'
  },

  // ============ 2027 ============
  // ============ JANUARY 2027 ============
  {
    indicator: 'PMI',
    name: 'ISM Manufacturing PMI (Dec)',
    date: '2027-01-04T10:00:00',
    forecast: 52.8,
    previous: 52.5,
    importance: 'medium'
  },
  {
    indicator: 'NFP',
    name: 'Non-Farm Payrolls (Dec)',
    date: '2027-01-08T08:30:00',
    forecast: 200,
    previous: 195,
    importance: 'high'
  },
  {
    indicator: 'CPI',
    name: 'CPI YoY (Dec)',
    date: '2027-01-13T08:30:00',
    forecast: 2.0,
    previous: 2.0,
    importance: 'high'
  },
  {
    indicator: 'FOMC',
    name: 'FOMC Rate Decision (Jan)',
    date: '2027-01-27T14:00:00',
    forecast: 3.00,
    previous: 3.00,
    importance: 'critical'
  },
  {
    indicator: 'GDP',
    name: 'GDP QoQ Advance (Q4 2026)',
    date: '2027-01-28T08:30:00',
    forecast: 2.4,
    previous: 2.6,
    importance: 'high'
  },
  {
    indicator: 'PCE',
    name: 'Core PCE Price Index YoY (Dec)',
    date: '2027-01-28T08:30:00',
    forecast: 2.0,
    previous: 2.0,
    importance: 'high'
  },

  // ============ FEBRUARY 2027 ============
  {
    indicator: 'PMI',
    name: 'ISM Manufacturing PMI (Jan)',
    date: '2027-02-01T10:00:00',
    forecast: 53.0,
    previous: 52.8,
    importance: 'medium'
  },
  {
    indicator: 'NFP',
    name: 'Non-Farm Payrolls (Jan)',
    date: '2027-02-05T08:30:00',
    forecast: 185,
    previous: 200,
    importance: 'high'
  },
  {
    indicator: 'CPI',
    name: 'CPI YoY (Jan)',
    date: '2027-02-10T08:30:00',
    forecast: 2.0,
    previous: 2.0,
    importance: 'high'
  },
  {
    indicator: 'PCE',
    name: 'Core PCE Price Index YoY (Jan)',
    date: '2027-02-25T08:30:00',
    forecast: 2.0,
    previous: 2.0,
    importance: 'high'
  },

  // ============ MARCH 2027 ============
  {
    indicator: 'PMI',
    name: 'ISM Manufacturing PMI (Feb)',
    date: '2027-03-01T10:00:00',
    forecast: 53.2,
    previous: 53.0,
    importance: 'medium'
  },
  {
    indicator: 'NFP',
    name: 'Non-Farm Payrolls (Feb)',
    date: '2027-03-05T08:30:00',
    forecast: 175,
    previous: 185,
    importance: 'high'
  },
  {
    indicator: 'CPI',
    name: 'CPI YoY (Feb)',
    date: '2027-03-10T08:30:00',
    forecast: 2.0,
    previous: 2.0,
    importance: 'high'
  },
  {
    indicator: 'FOMC',
    name: 'FOMC Rate Decision (Mar)',
    date: '2027-03-17T14:00:00',
    forecast: 2.75,
    previous: 3.00,
    importance: 'critical'
  },
  {
    indicator: 'GDP',
    name: 'GDP QoQ Third Estimate (Q4 2026)',
    date: '2027-03-25T08:30:00',
    forecast: 2.5,
    previous: 2.4,
    importance: 'high'
  },

  // ============ APRIL 2027 ============
  {
    indicator: 'PMI',
    name: 'ISM Manufacturing PMI (Mar)',
    date: '2027-04-01T10:00:00',
    forecast: 53.5,
    previous: 53.2,
    importance: 'medium'
  },
  {
    indicator: 'NFP',
    name: 'Non-Farm Payrolls (Mar)',
    date: '2027-04-02T08:30:00',
    forecast: 180,
    previous: 175,
    importance: 'high'
  },
  {
    indicator: 'CPI',
    name: 'CPI YoY (Mar)',
    date: '2027-04-14T08:30:00',
    forecast: 2.0,
    previous: 2.0,
    importance: 'high'
  },
  {
    indicator: 'FOMC',
    name: 'FOMC Rate Decision (Apr)',
    date: '2027-04-28T14:00:00',
    forecast: 2.75,
    previous: 2.75,
    importance: 'critical'
  },
  {
    indicator: 'GDP',
    name: 'GDP QoQ Advance (Q1 2027)',
    date: '2027-04-29T08:30:00',
    forecast: 2.3,
    previous: 2.5,
    importance: 'high'
  },

  // ============ MAY 2027 ============
  {
    indicator: 'PMI',
    name: 'ISM Manufacturing PMI (Apr)',
    date: '2027-05-03T10:00:00',
    forecast: 53.8,
    previous: 53.5,
    importance: 'medium'
  },
  {
    indicator: 'NFP',
    name: 'Non-Farm Payrolls (Apr)',
    date: '2027-05-07T08:30:00',
    forecast: 185,
    previous: 180,
    importance: 'high'
  },
  {
    indicator: 'CPI',
    name: 'CPI YoY (Apr)',
    date: '2027-05-12T08:30:00',
    forecast: 2.0,
    previous: 2.0,
    importance: 'high'
  },
  {
    indicator: 'PCE',
    name: 'Core PCE Price Index YoY (Apr)',
    date: '2027-05-27T08:30:00',
    forecast: 2.0,
    previous: 2.0,
    importance: 'high'
  },

  // ============ JUNE 2027 ============
  {
    indicator: 'PMI',
    name: 'ISM Manufacturing PMI (May)',
    date: '2027-06-01T10:00:00',
    forecast: 54.0,
    previous: 53.8,
    importance: 'medium'
  },
  {
    indicator: 'NFP',
    name: 'Non-Farm Payrolls (May)',
    date: '2027-06-04T08:30:00',
    forecast: 170,
    previous: 185,
    importance: 'high'
  },
  {
    indicator: 'FOMC',
    name: 'FOMC Rate Decision (Jun)',
    date: '2027-06-09T14:00:00',
    forecast: 2.50,
    previous: 2.75,
    importance: 'critical'
  },
  {
    indicator: 'CPI',
    name: 'CPI YoY (May)',
    date: '2027-06-10T08:30:00',
    forecast: 2.0,
    previous: 2.0,
    importance: 'high'
  },
  {
    indicator: 'GDP',
    name: 'GDP QoQ Third Estimate (Q1 2027)',
    date: '2027-06-24T08:30:00',
    forecast: 2.4,
    previous: 2.3,
    importance: 'high'
  },

  // ============ JULY 2027 ============
  {
    indicator: 'PMI',
    name: 'ISM Manufacturing PMI (Jun)',
    date: '2027-07-01T10:00:00',
    forecast: 54.2,
    previous: 54.0,
    importance: 'medium'
  },
  {
    indicator: 'NFP',
    name: 'Non-Farm Payrolls (Jun)',
    date: '2027-07-02T08:30:00',
    forecast: 175,
    previous: 170,
    importance: 'high'
  },
  {
    indicator: 'CPI',
    name: 'CPI YoY (Jun)',
    date: '2027-07-14T08:30:00',
    forecast: 2.0,
    previous: 2.0,
    importance: 'high'
  },
  {
    indicator: 'FOMC',
    name: 'FOMC Rate Decision (Jul)',
    date: '2027-07-28T14:00:00',
    forecast: 2.50,
    previous: 2.50,
    importance: 'critical'
  },
  {
    indicator: 'GDP',
    name: 'GDP QoQ Advance (Q2 2027)',
    date: '2027-07-29T08:30:00',
    forecast: 2.5,
    previous: 2.4,
    importance: 'high'
  },

  // ============ AUGUST 2027 ============
  {
    indicator: 'PMI',
    name: 'ISM Manufacturing PMI (Jul)',
    date: '2027-08-02T10:00:00',
    forecast: 54.5,
    previous: 54.2,
    importance: 'medium'
  },
  {
    indicator: 'NFP',
    name: 'Non-Farm Payrolls (Jul)',
    date: '2027-08-06T08:30:00',
    forecast: 180,
    previous: 175,
    importance: 'high'
  },
  {
    indicator: 'CPI',
    name: 'CPI YoY (Jul)',
    date: '2027-08-11T08:30:00',
    forecast: 2.0,
    previous: 2.0,
    importance: 'high'
  },

  // ============ SEPTEMBER 2027 ============
  {
    indicator: 'PMI',
    name: 'ISM Manufacturing PMI (Aug)',
    date: '2027-09-01T10:00:00',
    forecast: 54.8,
    previous: 54.5,
    importance: 'medium'
  },
  {
    indicator: 'NFP',
    name: 'Non-Farm Payrolls (Aug)',
    date: '2027-09-03T08:30:00',
    forecast: 185,
    previous: 180,
    importance: 'high'
  },
  {
    indicator: 'CPI',
    name: 'CPI YoY (Aug)',
    date: '2027-09-15T08:30:00',
    forecast: 2.0,
    previous: 2.0,
    importance: 'high'
  },
  {
    indicator: 'FOMC',
    name: 'FOMC Rate Decision (Sep)',
    date: '2027-09-15T14:00:00',
    forecast: 2.25,
    previous: 2.50,
    importance: 'critical'
  },
  {
    indicator: 'GDP',
    name: 'GDP QoQ Third Estimate (Q2 2027)',
    date: '2027-09-23T08:30:00',
    forecast: 2.6,
    previous: 2.5,
    importance: 'high'
  },

  // ============ OCTOBER 2027 ============
  {
    indicator: 'PMI',
    name: 'ISM Manufacturing PMI (Sep)',
    date: '2027-10-01T10:00:00',
    forecast: 55.0,
    previous: 54.8,
    importance: 'medium'
  },
  {
    indicator: 'NFP',
    name: 'Non-Farm Payrolls (Sep)',
    date: '2027-10-08T08:30:00',
    forecast: 190,
    previous: 185,
    importance: 'high'
  },
  {
    indicator: 'CPI',
    name: 'CPI YoY (Sep)',
    date: '2027-10-14T08:30:00',
    forecast: 2.0,
    previous: 2.0,
    importance: 'high'
  },
  {
    indicator: 'FOMC',
    name: 'FOMC Rate Decision (Oct)',
    date: '2027-10-27T14:00:00',
    forecast: 2.25,
    previous: 2.25,
    importance: 'critical'
  },
  {
    indicator: 'GDP',
    name: 'GDP QoQ Advance (Q3 2027)',
    date: '2027-10-28T08:30:00',
    forecast: 2.7,
    previous: 2.6,
    importance: 'high'
  },

  // ============ NOVEMBER 2027 ============
  {
    indicator: 'PMI',
    name: 'ISM Manufacturing PMI (Oct)',
    date: '2027-11-01T10:00:00',
    forecast: 55.2,
    previous: 55.0,
    importance: 'medium'
  },
  {
    indicator: 'NFP',
    name: 'Non-Farm Payrolls (Oct)',
    date: '2027-11-05T08:30:00',
    forecast: 195,
    previous: 190,
    importance: 'high'
  },
  {
    indicator: 'CPI',
    name: 'CPI YoY (Oct)',
    date: '2027-11-10T08:30:00',
    forecast: 2.0,
    previous: 2.0,
    importance: 'high'
  },

  // ============ DECEMBER 2027 ============
  {
    indicator: 'PMI',
    name: 'ISM Manufacturing PMI (Nov)',
    date: '2027-12-01T10:00:00',
    forecast: 55.5,
    previous: 55.2,
    importance: 'medium'
  },
  {
    indicator: 'NFP',
    name: 'Non-Farm Payrolls (Nov)',
    date: '2027-12-03T08:30:00',
    forecast: 200,
    previous: 195,
    importance: 'high'
  },
  {
    indicator: 'FOMC',
    name: 'FOMC Rate Decision (Dec)',
    date: '2027-12-08T14:00:00',
    forecast: 2.00,
    previous: 2.25,
    importance: 'critical'
  },
  {
    indicator: 'CPI',
    name: 'CPI YoY (Nov)',
    date: '2027-12-10T08:30:00',
    forecast: 2.0,
    previous: 2.0,
    importance: 'high'
  }
];

export class EventScheduler extends EventEmitter {
  constructor() {
    super();
    this.events = [...SCHEDULED_EVENTS];
    this.timers = [];
    this.demoMode = true; // Enable demo releases
    this.demoInterval = null;
  }

  start() {
    console.log('Event scheduler started');

    // Schedule real events
    this.scheduleEvents();

    // In demo mode, trigger simulated releases periodically
    if (this.demoMode) {
      this.startDemoMode();
    }
  }

  stop() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers = [];
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
    }
  }

  scheduleEvents() {
    const now = new Date();

    this.events.forEach(event => {
      const eventTime = new Date(event.date);
      const timeUntil = eventTime - now;

      if (timeUntil > 0) {
        // Emit upcoming warning 5 minutes before
        if (timeUntil > 5 * 60 * 1000) {
          const warningTimer = setTimeout(() => {
            this.emit('eventUpcoming', {
              ...event,
              minutesUntil: 5
            });
          }, timeUntil - 5 * 60 * 1000);
          this.timers.push(warningTimer);
        }

        // Emit release at scheduled time
        const releaseTimer = setTimeout(() => {
          this.triggerRelease(event);
        }, timeUntil);
        this.timers.push(releaseTimer);
      }
    });
  }

  startDemoMode() {
    // Trigger a demo event every 30 seconds
    let eventIndex = 0;

    // Initial demo event after 5 seconds
    setTimeout(() => {
      this.triggerDemoRelease();
    }, 5000);

    // Subsequent events every 45 seconds
    this.demoInterval = setInterval(() => {
      this.triggerDemoRelease();
    }, 45000);
  }

  triggerDemoRelease() {
    const demoEvents = [
      {
        indicator: 'CPI',
        name: 'CPI YoY (Demo)',
        forecast: 2.7,
        previous: 2.6
      },
      {
        indicator: 'NFP',
        name: 'Non-Farm Payrolls (Demo)',
        forecast: 175,
        previous: 256
      },
      {
        indicator: 'PMI',
        name: 'ISM Manufacturing PMI (Demo)',
        forecast: 49.0,
        previous: 49.3
      },
      {
        indicator: 'CLAIMS',
        name: 'Initial Jobless Claims (Demo)',
        forecast: 215,
        previous: 201
      },
      {
        indicator: 'FOMC',
        name: 'FOMC Rate Decision (Demo)',
        forecast: 4.50,
        previous: 4.50
      }
    ];

    const randomEvent = demoEvents[Math.floor(Math.random() * demoEvents.length)];

    // Generate actual value with surprise
    const surpriseFactor = (Math.random() - 0.5) * 0.1; // ±5% surprise
    let actual;

    if (randomEvent.indicator === 'NFP') {
      actual = Math.round(randomEvent.forecast * (1 + surpriseFactor * 3));
    } else if (randomEvent.indicator === 'CLAIMS') {
      actual = Math.round(randomEvent.forecast * (1 + surpriseFactor * 2));
    } else {
      actual = Math.round(randomEvent.forecast * (1 + surpriseFactor) * 10) / 10;
    }

    const surprise = ((actual - randomEvent.forecast) / randomEvent.forecast) * 100;

    this.emit('eventReleased', {
      ...randomEvent,
      actual,
      surprise: Math.round(surprise * 10) / 10,
      isDemo: true
    });

    console.log(`Demo event released: ${randomEvent.name} - Actual: ${actual}, Forecast: ${randomEvent.forecast}`);
  }

  triggerRelease(event) {
    // In a real scenario, this would fetch actual data from an API
    // For now, simulate an actual value
    const surpriseFactor = (Math.random() - 0.5) * 0.2;
    const actual = event.forecast * (1 + surpriseFactor);
    const surprise = ((actual - event.forecast) / event.forecast) * 100;

    this.emit('eventReleased', {
      ...event,
      actual: Math.round(actual * 10) / 10,
      surprise: Math.round(surprise * 10) / 10
    });
  }

  getUpcomingEvents(limit = 10) {
    const now = new Date();

    return this.events
      .filter(e => new Date(e.date) > now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, limit)
      .map(event => ({
        ...event,
        timeUntil: this.formatTimeUntil(new Date(event.date) - now)
      }));
  }

  formatTimeUntil(ms) {
    if (ms < 0) return 'Released';

    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  addEvent(event) {
    this.events.push(event);
    this.scheduleEvents();
  }
}
