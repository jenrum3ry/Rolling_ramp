import type { GameState } from '../types'
import { BREW_RECIPES } from '../data/brewer'
import { AURA_MAP } from '../data/auras'

interface Props {
  state: GameState
  onBrew: (recipeId: string) => void
}

function getInventoryCounts(state: GameState): Record<string, number> {
  return state.inventory.reduce<Record<string, number>>((acc, owned) => {
    acc[owned.definitionId] = (acc[owned.definitionId] ?? 0) + 1
    return acc
  }, {})
}

export function BrewerPanel({ state, onBrew }: Props) {
  const counts = getInventoryCounts(state)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-bold text-white mb-0.5">Brewer</h2>
        <p className="text-gray-500 text-xs">
          Consume auras from your inventory to brew powerful potions.
        </p>
      </div>

      {BREW_RECIPES.map((recipe) => {
        const canBrew = recipe.ingredients.every(
          (ing) => (counts[ing.auraId] ?? 0) >= ing.count
        )

        return (
          <div
            key={recipe.id}
            className="rounded-xl border p-4 flex flex-col gap-3"
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderColor: canBrew ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.08)',
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-white">{recipe.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{recipe.description}</p>
              </div>
              <button
                onClick={() => onBrew(recipe.id)}
                disabled={!canBrew}
                className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                style={
                  canBrew
                    ? {
                        background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                        color: '#fff',
                        boxShadow: '0 0 12px rgba(124,58,237,0.4)',
                      }
                    : {
                        background: 'rgba(255,255,255,0.06)',
                        color: '#4b5563',
                        cursor: 'not-allowed',
                      }
                }
              >
                Brew
              </button>
            </div>

            {/* Ingredients */}
            <div className="flex flex-wrap gap-2">
              {recipe.ingredients.map((ing) => {
                const have = counts[ing.auraId] ?? 0
                const met = have >= ing.count
                const auraDef = AURA_MAP[ing.auraId]
                return (
                  <div
                    key={ing.auraId}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs"
                    style={{
                      background: met
                        ? 'rgba(74,222,128,0.1)'
                        : 'rgba(248,113,113,0.1)',
                      border: `1px solid ${met ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
                    }}
                  >
                    {/* Aura color dot */}
                    <div
                      className="rounded-full shrink-0"
                      style={{
                        width: 8,
                        height: 8,
                        background: auraDef?.color ?? '#9ca3af',
                        boxShadow: `0 0 4px ${auraDef?.color ?? '#9ca3af'}`,
                      }}
                    />
                    <span className={met ? 'text-green-400' : 'text-red-400'}>
                      {auraDef?.name ?? ing.auraId}
                    </span>
                    <span className={met ? 'text-green-600' : 'text-red-600'}>
                      {have}/{ing.count}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {BREW_RECIPES.length === 0 && (
        <p className="text-gray-600 text-sm text-center py-8">No recipes available yet.</p>
      )}
    </div>
  )
}
