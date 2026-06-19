  // Troskovnik breakdown by category
  const breakdown: Record<string, number> = {}
  for (const item of items) {
    const cat = item.category || 'ostalo'
    breakdown[cat] = (breakdown[cat] || 0) + Number(item.total)
  }
