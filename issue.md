Critical Issues
1. Proposed modules already exist
The plan proposes creating src/feature/calculator/core/artifacts/ with constants.ts, builder.ts, optimizer.ts. These already exist at:
- src/core/artifact-constants.ts
- src/core/artifact-builder.ts 
- src/core/optimizer.ts
2. LiteGraph/UI layer doesn't exist here
This is aminus-ts - a pure calculation library. There are no:
- .tsx files
- registerCalculatorNodes.ts
- GraphWorkspace.tsx
- StatTableLike interface (only StatTable class)
The plan describes a separate UI application wrapping this library.
3. 4+1 mode mismatch
ArtifactBuilder.kqmAll4StarWith5Star() exists but uses index 0-2 for sands/goblet/circlet only. The plan proposes flower|feather|sands|goblet|circlet - a different API.
4. Folder structure wrong
Plan: src/feature/calculator/core/artifacts/
Actual: src/core/
What IS Faithful
- Optimization algorithm (ER-first, greedy allocation)
- N^3 main stat search (globalKqmcArtifactMainStatOptimizer)
- KQMC constraints (2 rolls/substat/artifact)
- Data fixtures in src/data/ are already imported and used
Recommendation
The plan conflates two different projects:
1. aminus-ts (this library) - already has the core artifact optimization
2. A graph-based UI - doesn't exist here; would be a separate consumer of aminus
If you want to enhance aminus-ts, focus on:
- Extending kqmAll4StarWith5Star() to support flower/feather as 5-star slot
- Adding StatTableLike for JSON serialization
- Adding RotationPayload type with buff tables
For the LiteGraph nodes, that belongs in a separate UI repo that imports from aminus.