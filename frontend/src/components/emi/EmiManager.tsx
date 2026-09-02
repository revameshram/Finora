import React, { useState } from 'react';
import { LoanList } from './LoanList';
import { LoanDetail } from './LoanDetail';

export const EmiManager: React.FC = () => {
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);

  if (selectedLoanId) {
    return (
      <LoanDetail
        loanId={selectedLoanId}
        onBack={() => setSelectedLoanId(null)}
      />
    );
  }

  return <LoanList onSelectLoan={(id) => setSelectedLoanId(id)} />;
};

export default EmiManager;
