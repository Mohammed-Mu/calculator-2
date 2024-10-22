"use client"

import React, { useState, useEffect, useCallback } from 'react'

function LoadingPage() {
  const [progress, setProgress] = useState(0)
  const [currentNumber, setCurrentNumber] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(timer)
          return 100
        }
        const newProgress = oldProgress + 1
        setCurrentNumber(Math.floor(Math.random() * 10))
        return newProgress
      })
    }, 50)

    return () => {
      clearInterval(timer)
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="text-6xl font-bold mb-8 animate-pulse">
        {currentNumber}
      </div>
      <div className="w-64 h-4 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-purple-600 transition-all duration-100 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="mt-4 text-lg">
        Loading Calculator... {progress}%
      </div>
      <div className="mt-8 text-sm text-gray-400 max-w-md text-center">
        <p className="mb-2">Did you know?</p>
        <p>The word &quot;calculator&quot; comes from the Latin word &quot;calculare,&quot; which means &quot;to count using small stones.&quot;</p>
      </div>
    </div>
  )
}

export default function ModernDarkCalculator() {
  const [isLoading, setIsLoading] = useState(true)
  const [display, setDisplay] = useState('0')
  const [prevValue, setPrevValue] = useState<number | null>(null)
  const [operator, setOperator] = useState<string | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [activeKey, setActiveKey] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 5000) // 5 seconds loading time

    return () => clearTimeout(timer)
  }, [])

  const inputDigit = useCallback((digit: string) => {
    setDisplay(waitingForOperand ? digit : display === '0' ? digit : display + digit)
    setWaitingForOperand(false)
  }, [display, waitingForOperand])

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.')
      setWaitingForOperand(false)
    } else if (!display.includes('.')) {
      setDisplay(display + '.')
    }
  }, [display, waitingForOperand])

  const clearDisplay = useCallback(() => {
    setDisplay('0')
    setPrevValue(null)
    setOperator(null)
    setWaitingForOperand(false)
  }, [])

  const performOperation = useCallback((nextOperator: string) => {
    const inputValue = parseFloat(display)

    if (prevValue === null) {
      setPrevValue(inputValue)
    } else if (operator) {
      const currentValue = prevValue || 0
      const newValue = calculateOperation(operator, currentValue, inputValue)
      setPrevValue(newValue)
      setDisplay(String(newValue))
    }

    setWaitingForOperand(true)
    setOperator(nextOperator)
  }, [display, prevValue, operator])

  const calculateOperation = (op: string, a: number, b: number): number => {
    switch (op) {
      case '+': return a + b
      case '-': return a - b
      case '×': return a * b
      case '÷': return a / b
      default: return b
    }
  }

  const handleEquals = useCallback(() => {
    if (operator && prevValue !== null) {
      const inputValue = parseFloat(display)
      const result = calculateOperation(operator, prevValue, inputValue)
      setDisplay(String(result))
      setPrevValue(null)
      setOperator(null)
      setWaitingForOperand(true)
    }
  }, [display, operator, prevValue])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    let key = event.key

    if (key === '*') key = '×'
    if (key === '/') key = '÷'

    if (/^[0-9.]$/.test(key)) {
      event.preventDefault()
      if (key === '.') {
        inputDecimal()
      } else {
        inputDigit(key)
      }
    } else if (['+', '-', '×', '÷'].includes(key)) {
      event.preventDefault()
      performOperation(key)
    } else if (key === 'Enter' || key === '=') {
      event.preventDefault()
      handleEquals()
    } else if (key === 'Backspace') {
      event.preventDefault()
      setDisplay(display.slice(0, -1) || '0')
    } else if (key === 'Escape') {
      event.preventDefault()
      clearDisplay()
    }

    setActiveKey(key)
  }, [inputDecimal, inputDigit, performOperation, handleEquals, display, clearDisplay])

  const handleKeyUp = useCallback(() => {
    setActiveKey(null)
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  if (isLoading) {
    return <LoadingPage />
  }

  const buttonClass = "w-full h-24 rounded-full text-3xl font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"

  const handleButtonClick = (key: string) => {
    switch (key) {
      case '=':
        handleEquals();
        break;
      case '+':
      case '-':
      case '×':
      case '÷':
        performOperation(key);
        break;
      case '.':
        inputDecimal();
        break;
      case 'C':
        clearDisplay();
        break;
      case '⌫':
        setDisplay(display.slice(0, -1) || '0');
        break;
      default:
        inputDigit(key);
        break;
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-6">
      <div className="bg-gray-800 rounded-3xl shadow-lg p-8 w-full max-w-lg">
        <div className="bg-gray-700 p-6 rounded-2xl mb-6">
          <input
            type="text"
            className="w-full text-right text-5xl font-bold bg-transparent text-white outline-none"
            value={display}
            readOnly
          />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {['C', '÷', '×', '⌫', '7', '8', '9', '-', '4', '5', '6', '+', '1', '2', '3', '=', '0', '.'].map((key) => (
            <button
              key={key}
              onClick={() => handleButtonClick(key)}
              className={`${buttonClass} ${
                ['÷', '×', '-', '+', '='].includes(key)
                  ? 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800'
                  : key === 'C'
                  ? 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700'
                  : 'bg-gray-700 text-white hover:bg-gray-600 active:bg-gray-500'
              } ${activeKey === key ? 'ring-2 ring-purple-500 ring-opacity-50' : ''}`}
              aria-label={key === '⌫' ? 'Backspace' : key}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
