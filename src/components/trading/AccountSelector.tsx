'use client';

import { useState } from 'react';

export default function AccountSelector() {
  const [account, setAccount] = useState('none');

  return (
    <div className="field">
      <label htmlFor="deriv-account">Deriv account</label>

      <select
        id="deriv-account"
        value={account}
        onChange={(event) => setAccount(event.target.value)}
      >
        <option value="none">No account connected</option>
        <option value="demo" disabled>
          Demo account — connect Deriv first
        </option>
        <option value="live" disabled>
          Live account — connect Deriv first
        </option>
      </select>

      <span className="field-help">
        This preview does not access or list real accounts. Connect Deriv and
        load verified account data before selecting an account.
      </span>
    </div>
  );
}