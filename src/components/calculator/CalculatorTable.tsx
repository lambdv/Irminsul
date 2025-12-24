"use client";
import React from 'react';
import Table from '@/components/archive/Table';
import styles from './calculator.module.css';

type CalculatorTableProps = {
  header: React.ReactNode;
  body: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export default function CalculatorTable({
  header,
  body,
  className = '',
  style,
}: CalculatorTableProps) {
  return (
    <div className={`${styles.tableContainer} ${className}`} style={style}>
      <Table header={header} body={body} />
    </div>
  );
}


