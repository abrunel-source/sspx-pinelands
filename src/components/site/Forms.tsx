'use client'

import { useActionState, useEffect, useState } from 'react'

import { type FormState, getFormTicket, submitForm } from '@/app/(frontend)/actions'

const initial: FormState = { status: 'idle' }

/** Spam check: a signed ticket fetched once the page runs, renewed after every reply. */
const useTicket = (state: FormState) => {
  const [ticket, setTicket] = useState('')
  useEffect(() => {
    let live = true
    getFormTicket()
      .then((value) => live && setTicket(value))
      .catch(() => {})
    return () => {
      live = false
    }
  }, [state])
  return ticket
}

const Honeypot = () => (
  <div className="honeypot" aria-hidden="true">
    <label>
      Leave this empty
      <input type="text" name="website" tabIndex={-1} autoComplete="off" />
    </label>
  </div>
)

const Status = ({ state, id }: { state: FormState; id: string }) => (
  <p id={id} className={`form-status${state.status === 'error' ? ' is-error' : ''}`} role="status" aria-live="polite">
    {state.status !== 'idle' ? state.message : ''}
  </p>
)

/** Single email field + button, used for the mailing list and school registrations. */
export const EmailSignupForm = ({
  formType,
  buttonLabel,
  buttonClass = 'btn btn-navy',
  inputId,
}: {
  formType: 'newsletter' | 'school'
  buttonLabel: string
  buttonClass?: string
  inputId: string
}) => {
  const [state, action, pending] = useActionState(submitForm, initial)
  const ticket = useTicket(state)
  if (state.status === 'success') return <Status state={state} id={`${inputId}-status`} />
  return (
    <form action={action} className="inline-form" noValidate>
      <input type="hidden" name="formType" value={formType} />
      <input type="hidden" name="ticket" value={ticket} />
      <Honeypot />
      <label htmlFor={inputId} className="visually-hidden">
        Email address
      </label>
      <input
        id={inputId}
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="Your email address"
        className="input"
        aria-invalid={Boolean(state.errors?.email)}
        aria-describedby={`${inputId}-status`}
      />
      <button type="submit" className={buttonClass} disabled={pending}>
        {pending ? 'Sending…' : buttonLabel}
      </button>
      <Status state={state} id={`${inputId}-status`} />
    </form>
  )
}

export const ContactForm = ({ topics, phone }: { topics: string[]; phone: string }) => {
  const [state, action, pending] = useActionState(submitForm, initial)
  const ticket = useTicket(state)

  if (state.status === 'success') {
    return (
      <div className="contact-form contact-form--done double-frame">
        <h3 className="serif">Message sent</h3>
        <Status state={state} id="contact-status" />
      </div>
    )
  }

  return (
    <form action={action} className="contact-form double-frame" noValidate aria-describedby="contact-status">
      <input type="hidden" name="formType" value="contact" />
      <input type="hidden" name="ticket" value={ticket} />
      <Honeypot />
      <div className="row">
        <div className="field">
          <label htmlFor="c-name">Name</label>
          <input id="c-name" name="name" type="text" required autoComplete="name" className="input" aria-invalid={Boolean(state.errors?.name)} />
          {state.errors?.name && <span className="field-error">{state.errors.name}</span>}
        </div>
        <div className="field">
          <label htmlFor="c-email">Email</label>
          <input id="c-email" name="email" type="email" required autoComplete="email" className="input" aria-invalid={Boolean(state.errors?.email)} />
          {state.errors?.email && <span className="field-error">{state.errors.email}</span>}
        </div>
      </div>
      <div className="field">
        <label htmlFor="c-topic">What is it about?</label>
        <select id="c-topic" name="topic" className="input">
          {topics.map((topic) => (
            <option key={topic}>{topic}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="c-msg">Message</label>
        <textarea id="c-msg" name="message" rows={6} required className="input" aria-invalid={Boolean(state.errors?.message)} />
        {state.errors?.message && <span className="field-error">{state.errors.message}</span>}
      </div>
      <button type="submit" className="btn btn-wine" disabled={pending}>
        {pending ? 'Sending…' : 'Send message'}
      </button>
      <Status state={state} id="contact-status" />
      <p className="form-note">For urgent sick calls, please telephone {phone}.</p>
    </form>
  )
}
