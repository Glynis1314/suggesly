import React from 'react';
import PropTypes from 'prop-types';
import { formatDate } from '../utils/format';

export default function DateCell({ date }) {
  return <div className="text-sm font-semibold text-text-primary">{formatDate(date)}</div>;
}

DateCell.propTypes = {
  date: PropTypes.string,
};

