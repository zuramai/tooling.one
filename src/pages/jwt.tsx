import { useState, useEffect } from "react"
import { decode } from "jws"
import { Layout } from "../components/Layout"
import { Column, TwoColumns } from "~/components/TwoColumns"
import { Textarea } from "~/components/Textarea"

const stringify = (data: any) => JSON.stringify(data, null, 2)

function base64url(str: string) {
  return window
    .btoa(str)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
}

function strToJson(str: string, pretty = false) {
  return JSON.stringify(JSON.parse(str), null, pretty ? 2 : 0)
}

export default function JwtPage() {
  const [input, setInput] = useState("")
  const [header, setHeader] = useState("{}")
  const [payload, setPayload] = useState("{}")
  const [signature, setSignature] = useState("")
  const [decodeError, setDecodeError] = useState("")
  const [encodeError, setEncodeError] = useState("")

  useEffect(() => {
    decodeInput(input)
  }, [])

  const clearError = () => {
    setDecodeError("")
    setEncodeError("")
  }

  const handleInputChange = (value: string) => {
    setInput(value)
    decodeInput(value)
  }

  const decodeInput = (input: string) => {
    try {
      clearError()
      if (!input) return
      const decoded = decode(input)
      if (!decoded) throw new Error(`Invalid token`)

      setPayload(
        typeof decoded.payload === "string"
          ? strToJson(decoded.payload, true)
          : stringify(decoded.payload)
      )
      setHeader(stringify(decoded.header))
      setSignature(decoded.signature)
    } catch (err) {
      setDecodeError(err.message)
    }
  }

  const updateInput = () => {
    try {
      clearError()
      const token = `${base64url(strToJson(header))}.${base64url(
        strToJson(payload)
      )}.${signature}`
      setInput(token)
    } catch (err) {
      setEncodeError(err.message)
    }
  }

  const handleHeaderChange = (value: string) => {
    setHeader(value)
  }

  const handlePayloadChange = (value: string) => {
    setPayload(value)
  }

  const handleSignatureChange = (value: string) => {
    setSignature(value)
  }

  useEffect(() => {
    updateInput()
  }, [header, payload, signature])

  return (
    <Layout>
      <TwoColumns>
        <Column title="JWT">
          {decodeError && (
            <div className="px-5 py-3 text-white bg-red-500 rounded-lg mb-3">
              {decodeError}
            </div>
          )}
          <div>
            <Textarea
              fullWidth
              value={input}
              onChange={handleInputChange}
            ></Textarea>
          </div>
        </Column>
        <Column title="Decoded">
          {encodeError && (
            <div className="px-5 py-3 text-white bg-red-500 rounded-lg mb-3">
              {encodeError}
            </div>
          )}
          <div className="space-y-5">
            <div>
              <div className="mb-2">Header:</div>
              <Textarea
                fullWidth
                rows={5}
                value={header}
                onChange={handleHeaderChange}
              ></Textarea>
            </div>
            <div>
              <div className="mb-2">Payload:</div>
              <Textarea
                fullWidth
                rows={5}
                value={payload}
                onChange={handlePayloadChange}
              ></Textarea>
            </div>
            <div>
              <div className="mb-2">Signature:</div>
              <Textarea
                fullWidth
                rows={5}
                value={signature}
                onChange={handleSignatureChange}
              ></Textarea>
            </div>
          </div>
        </Column>
      </TwoColumns>
    </Layout>
  )
}
