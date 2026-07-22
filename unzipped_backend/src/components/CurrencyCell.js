import React from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '../utils/format';

export default function CurrencyCell({ value }) {
  return <span className="text-sm font-semibold text-text-primary">{formatCurrency(value)}</span>;
}

CurrencyCell.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

