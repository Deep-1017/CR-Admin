import { ReactNode } from "react";

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = "" }: TableProps) {
  return (
    <div className={`table-wrapper ${className}`}>
      <table className="table">
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }: TableProps) {
  return <thead className="table-header">{children}</thead>;
}

export function TableBody({ children }: TableProps) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children, className = "" }: TableProps) {
  return <tr className={`table-row ${className}`}>{children}</tr>;
}

export function TableHead({ children, className = "" }: TableProps) {
  return <th className={`table-header-cell ${className}`}>{children}</th>;
}

export function TableCell({ children, className = "" }: TableProps) {
  return <td className={`table-cell ${className}`}>{children}</td>;
}
