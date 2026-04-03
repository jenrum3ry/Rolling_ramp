import { motion } from 'framer-motion'
import type { AuraDefinition } from '../types'
import { AuraEffect } from './AuraEffect'

interface Props {
  aura: AuraDefinition | null
  facingLeft: boolean
  jumping: boolean
}

// ─── Aura-specific stands (poses) ───────────────────────────────────────────
function AstralArms() {
  return (
    <>
      {/* Left arm raised */}
      <div
        className="absolute rounded-full bg-gray-600"
        style={{
          width: 8,
          height: 22,
          bottom: 38,
          left: -10,
          transformOrigin: 'bottom center',
          transform: 'rotate(-60deg)',
        }}
      />
      {/* Right arm raised */}
      <div
        className="absolute rounded-full bg-gray-600"
        style={{
          width: 8,
          height: 22,
          bottom: 38,
          right: -10,
          transformOrigin: 'bottom center',
          transform: 'rotate(60deg)',
        }}
      />
    </>
  )
}

function PlaidenShield() {
  return (
    <>
      {/* Shield */}
      <div
        className="absolute rounded border-2 border-cyan-400"
        style={{
          width: 18,
          height: 22,
          bottom: 30,
          left: -22,
          background: 'rgba(34,211,238,0.25)',
        }}
      />
      {/* Wind gust 1 */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 30,
          height: 3,
          bottom: 36,
          left: -50,
          background: 'rgba(207,250,254,0.5)',
        }}
        animate={{ x: [0, 20, 0], opacity: [0, 0.7, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Wind gust 2 */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 22,
          height: 2,
          bottom: 30,
          left: -44,
          background: 'rgba(207,250,254,0.4)',
        }}
        animate={{ x: [0, 18, 0], opacity: [0, 0.5, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: 0.4, ease: 'easeInOut' }}
      />
    </>
  )
}

function DefaultArms() {
  return (
    <>
      {/* Left arm */}
      <div
        className="absolute rounded-full bg-gray-600"
        style={{
          width: 8,
          height: 20,
          bottom: 36,
          left: -10,
          transformOrigin: 'top center',
          transform: 'rotate(15deg)',
        }}
      />
      {/* Right arm */}
      <div
        className="absolute rounded-full bg-gray-600"
        style={{
          width: 8,
          height: 20,
          bottom: 36,
          right: -10,
          transformOrigin: 'top center',
          transform: 'rotate(-15deg)',
        }}
      />
    </>
  )
}

export function PlayerCharacter({ aura, facingLeft, jumping }: Props) {
  const characterSize = 120

  const stand = aura?.id === 'astral'
    ? 'astral'
    : aura?.id === 'plaiden'
    ? 'plaiden'
    : 'default'

  return (
    <motion.div
      className="relative flex items-center justify-center"
      style={{
        width: characterSize,
        height: characterSize,
        transform: facingLeft ? 'scaleX(-1)' : 'scaleX(1)',
      }}
      animate={jumping ? { y: [-30, 0] } : { y: 0 }}
      transition={jumping ? { duration: 0.5, ease: [0.2, 0, 0.8, 1] } : {}}
    >
      {/* Aura effect behind character */}
      {aura && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <AuraEffect aura={aura} size={50} />
        </div>
      )}

      {/* Character body */}
      <div className="relative" style={{ width: 36, height: 72 }}>
        {/* Head */}
        <div
          className="absolute rounded-full bg-gray-500 border border-gray-400"
          style={{ width: 28, height: 28, top: 0, left: 4 }}
        />
        {/* Body */}
        <div
          className="absolute rounded-md bg-gray-600 border border-gray-500"
          style={{ width: 30, height: 28, top: 26, left: 3 }}
        />
        {/* Arms */}
        {stand === 'astral' && <AstralArms />}
        {stand === 'plaiden' && <PlaidenShield />}
        {stand === 'default' && <DefaultArms />}
        {/* Left leg */}
        <div
          className="absolute rounded-b-md bg-gray-600 border border-gray-500"
          style={{ width: 12, height: 18, bottom: 0, left: 2 }}
        />
        {/* Right leg */}
        <div
          className="absolute rounded-b-md bg-gray-600 border border-gray-500"
          style={{ width: 12, height: 18, bottom: 0, right: 2 }}
        />
      </div>
    </motion.div>
  )
}
