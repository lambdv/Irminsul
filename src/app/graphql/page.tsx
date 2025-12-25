"use client"
import { useState } from 'react'
import styles from './graphql.module.css'

export default function GraphQLPage() {
  const [query, setQuery] = useState(`query {
  searchPages {
    id
    name
    category
    rarity
  }
}`)
  const [variables, setVariables] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const executeQuery = async () => {
    setLoading(true)
    setResponse('')
    try {
      const res = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: variables ? JSON.parse(variables) : undefined,
        }),
      })
      const data = await res.json()
      setResponse(JSON.stringify(data, null, 2))
    } catch (error: any) {
      setResponse(JSON.stringify({ error: error.message }, null, 2))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>GraphQL Playground</h1>
        <p>Explore and test the Irminsul GraphQL API</p>
      </div>

      <div className={styles.content}>
        <div className={styles.docs}>
          <h2>Documentation</h2>
          
          <section className={styles.section}>
            <h3>Endpoint</h3>
            <code className={styles.code}>POST /api/graphql</code>
          </section>

          <section className={styles.section}>
            <h3>Queries</h3>
            <div className={styles.queryGroup}>
              <h4>searchPages</h4>
              <p>Get minimal data for search functionality (id, name, category, rarity)</p>
              <pre className={styles.codeBlock}>{`query {
  searchPages {
    id
    name
    category
    rarity
  }
}`}</pre>
            </div>

            <div className={styles.queryGroup}>
              <h4>getCharacters</h4>
              <p>Get all characters with full details</p>
              <pre className={styles.codeBlock}>{`query {
  getCharacters {
    name
    key
    rarity
    element
    weapon
    region
    description
  }
}`}</pre>
            </div>

            <div className={styles.queryGroup}>
              <h4>getCharacter</h4>
              <p>Get a specific character by key</p>
              <pre className={styles.codeBlock}>{`query {
  getCharacter(key: "diluc") {
    name
    key
    rarity
    element
    talents {
      name
      type
      description
    }
    constellations {
      level
      name
      description
    }
  }
}`}</pre>
            </div>

            <div className={styles.queryGroup}>
              <h4>getWeapons</h4>
              <p>Get all weapons with full details</p>
              <pre className={styles.codeBlock}>{`query {
  getWeapons {
    name
    key
    rarity
    category
    baseAtkMin
    baseAtkMax
    subStatType
  }
}`}</pre>
            </div>

            <div className={styles.queryGroup}>
              <h4>getWeapon</h4>
              <p>Get a specific weapon by key</p>
              <pre className={styles.codeBlock}>{`query {
  getWeapon(key: "wolfs-gravestone") {
    name
    key
    rarity
    refinements
    baseStats {
      level
      baseATK
      subStatValue
    }
  }
}`}</pre>
            </div>

            <div className={styles.queryGroup}>
              <h4>getArtifactSets</h4>
              <p>Get all artifact sets with full details</p>
              <pre className={styles.codeBlock}>{`query {
  getArtifactSets {
    name
    key
    rarityMin
    rarityMax
    bonuses {
      twoPiece
      fourPiece
    }
  }
}`}</pre>
            </div>

            <div className={styles.queryGroup}>
              <h4>getArtifactSet</h4>
              <p>Get a specific artifact set by key</p>
              <pre className={styles.codeBlock}>{`query {
  getArtifactSet(key: "crimson-witch-of-flames") {
    name
    key
    flower {
      name
      description
    }
    bonuses {
      twoPiece
      fourPiece
    }
  }
}`}</pre>
            </div>
          </section>

          <section className={styles.section}>
            <h3>Types</h3>
            <div className={styles.typeGroup}>
              <h4>Enums</h4>
              <ul>
                <li><code>Element</code>: PYRO, HYDRO, ANEMO, ELECTRO, DENDRO, CRYO, GEO</li>
                <li><code>WeaponType</code>: SWORD, CLAYMORE, POLEARM, BOW, CATALYST</li>
                <li><code>TalentType</code>: NORMAL_ATTACK, ELEMENTAL_SKILL, ELEMENTAL_BURST</li>
                <li><code>PassiveType</code>: ASCENSION_1, ASCENSION_4, UTILITY</li>
                <li><code>WeaponSubStat</code>: CRIT_RATE, CRIT_DMG, ATK_PERCENT, HP_PERCENT, DEF_PERCENT, ENERGY_RECHARGE, ELEMENTAL_MASTERY</li>
              </ul>
            </div>
          </section>
        </div>

        <div className={styles.playground}>
          <h2>Playground</h2>
          
          <div className={styles.editorGroup}>
            <label>Query</label>
            <textarea
              className={styles.editor}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your GraphQL query here..."
            />
          </div>

          <div className={styles.editorGroup}>
            <label>Variables (JSON, optional)</label>
            <textarea
              className={styles.editor}
              value={variables}
              onChange={(e) => setVariables(e.target.value)}
              placeholder='{"key": "value"}'
            />
          </div>

          <button 
            className={styles.executeButton}
            onClick={executeQuery}
            disabled={loading}
          >
            {loading ? 'Executing...' : 'Execute Query'}
          </button>

          <div className={styles.editorGroup}>
            <label>Response</label>
            <pre className={styles.response}>
              {response || 'Click "Execute Query" to see results...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

