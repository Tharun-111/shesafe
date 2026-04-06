import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SECRET_CODE = '1234=';

export default function DiscreetMode() {
  const [display, setDisplay] = useState('0');
  const [input, setInput] = useState('');
  const navigate = useNavigate();

  const handleButton = (val) => {
    if (val === 'C') {
      setDisplay('0');
      setInput('');
      return;
    }
    if (val === '⌫') {
      const newInput = input.slice(0, -1);
      setInput(newInput);
      setDisplay(newInput || '0');
      return;
    }
    if (val === '=') {
      const newInput = input + '=';
      // Check secret code
      if (newInput === SECRET_CODE) {
        navigate('/login');
        return;
      }
      // Evaluate math expression
      try {
        const expr = input.replace(/×/g, '*').replace(/÷/g, '/');
        // eslint-disable-next-line no-eval
        const result = eval(expr);
        setDisplay(String(result));
        setInput(String(result));
      } catch {
        setDisplay('Error');
        setInput('');
      }
      return;
    }
    const newInput = (input === '0' || input === 'Error') ? val : input + val;
    setInput(newInput);
    setDisplay(newInput);
  };

  const buttons = [
    ['C', '⌫', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '='],
  ];

  const isOperator = (v) => ['÷', '×', '-', '+', '%'].includes(v);
  const isSpecial = (v) => ['C', '⌫'].includes(v);

  return (
    <div style={{
      minHeight: '100vh', background: '#1c1c1e',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      maxWidth: '480px', margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      {/* Display */}
      <div style={{ padding: '20px 24px 10px', textAlign: 'right' }}>
        <div style={{ fontSize: '12px', color: '#636366', minHeight: '20px' }}>
          {input || ''}
        </div>
        <div style={{
          fontSize: display.length > 10 ? '36px' : '72px',
          fontWeight: '200', color: 'white', lineHeight: 1.1,
          wordBreak: 'break-all',
        }}>
          {display}
        </div>
      </div>

      {/* Hint */}
      <div style={{ textAlign: 'center', padding: '8px', fontSize: '11px', color: '#48484a' }}>
        Enter 1234= to unlock
      </div>

      {/* Buttons */}
      <div style={{ padding: '8px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        {buttons.flat().map((btn, i) => {
          const isZero = btn === '0';
          const isEq = btn === '=';
          const isOp = isOperator(btn);
          const isSp = isSpecial(btn);

          return (
            <button
              key={`${btn}-${i}`}
              onClick={() => handleButton(btn)}
              style={{
                gridColumn: isZero ? 'span 2' : 'span 1',
                padding: '22px',
                borderRadius: '50px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '28px',
                fontWeight: isSp ? '400' : '300',
                background: isEq || isOp ? '#ff9f0a' : isSp ? '#636366' : '#2c2c2e',
                color: isEq || isOp ? 'white' : isSp ? 'white' : 'white',
                transition: 'opacity 0.1s',
                display: 'flex', alignItems: 'center', justifyContent: isZero ? 'flex-start' : 'center',
                paddingLeft: isZero ? '32px' : undefined,
                WebkitTapHighlightColor: 'transparent',
              }}
              onMouseDown={e => e.currentTarget.style.opacity = '0.7'}
              onMouseUp={e => e.currentTarget.style.opacity = '1'}
            >
              {btn}
            </button>
          );
        })}
      </div>
      <div style={{ height: '24px' }} />
    </div>
  );
}
