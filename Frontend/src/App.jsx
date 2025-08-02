"use client"
import { useState, useEffect } from 'react'
import "prismjs/themes/prism-tomorrow.css"
import Editor from "react-simple-code-editor"
import prism from "prismjs"
import Markdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"
import axios from 'axios'
import './App.css'
import Split from 'react-split'

// Load additional Prism languages if needed
import "prismjs/components/prism-python"

function App() {
  const [code, setCode] = useState(`function sum() {\n  return 1 + 1\n}`)
  const [review, setReview] = useState(``)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [theme, setTheme] = useState("dark")
  const [language, setLanguage] = useState("javascript")

  useEffect(() => {
    prism.highlightAll()
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  async function reviewCode() {
    setLoading(true)
    try {
      const response = await axios.post('http://localhost:3001/ai/get-review', {
        code,
        language
      })
      setReview(response.data)
    } catch (err) {
      console.error("Error fetching review:", err)
    }
    setLoading(false)
  }

  function handleCopy(text) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <>
      {/* Theme Toggle */}
      <div className="theme-toggle">
        <button className="glow-button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* Language Toggle */}
      <div className="language-toggle">
        <button className="glow-button" onClick={() =>
          setLanguage(language === "javascript" ? "python" : "javascript")
        }>
          {language === "javascript" ? "🐍 Python Mode" : "🟨 JavaScript Mode"}
        </button>
      </div>

      {/* Resizable Split View */}
      <Split
        className="split"
        sizes={[50, 50]}
        minSize={300}
        gutterSize={8}
        direction="horizontal"
      >
        {/* Left Panel (Editor + Button) */}
        <div className="left">
          <div className="copy-code-container">
            <div className="glow-button tooltip" onClick={() => handleCopy(code)}>
              {copied ? "✅ Copied!" : "📋 Copy Code"}
              <span className="tooltiptext">Copy your code to clipboard</span>
            </div>
          </div>

          <div className="code">
            <Editor
              value={code}
              onValueChange={setCode}
              highlight={code => prism.highlight(code, prism.languages[language], language)}
              padding={10}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 16,
                height: "100%",
                width: "100%"
              }}
            />
          </div>

          <div
            onClick={(e) => {
              const button = e.currentTarget
              const ripple = document.createElement("span")
              const size = Math.max(button.offsetWidth, button.offsetHeight)
              const x = e.clientX - button.getBoundingClientRect().left - size / 2
              const y = e.clientY - button.getBoundingClientRect().top - size / 2

              ripple.style.width = ripple.style.height = `${size}px`
              ripple.style.left = `${x}px`
              ripple.style.top = `${y}px`
              ripple.style.position = "absolute"
              ripple.style.background = "rgba(0,255,255,0.4)"
              ripple.style.borderRadius = "50%"
              ripple.style.transform = "scale(0)"
              ripple.style.animation = "ripple 0.6s linear"
              ripple.style.pointerEvents = "none"
              ripple.classList.add("ripple")

              button.appendChild(ripple)

              setTimeout(() => {
                ripple.remove()
              }, 600)

              reviewCode()
            }}
            className={`glow-button ${loading ? "loading" : ""}`}
          >
            {loading ? "⚡ Reviewing..." : "Review"}
          </div>
        </div>

        {/* Right Panel (Markdown Output) */}
        <div className="right">
          <Markdown rehypePlugins={[rehypeHighlight]}>
            {review}
          </Markdown>
        </div>
      </Split>
    </>
  )
}

export default App
