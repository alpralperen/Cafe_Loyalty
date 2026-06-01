import { BEANS_PER_FREE_COFFEE } from './config.js'

/** Çekirdek ekler; her 10 çekirdekte 1 ücretsiz kahve hakkı verir */
export function applyBeans(beansCount, freeCoffees, earned) {
  let beans = beansCount + earned
  let free = freeCoffees
  while (beans >= BEANS_PER_FREE_COFFEE) {
    beans -= BEANS_PER_FREE_COFFEE
    free += 1
  }
  return { beans_count: beans, free_coffees: free, coffees_earned: Math.floor((beansCount + earned) / BEANS_PER_FREE_COFFEE) - Math.floor(beansCount / BEANS_PER_FREE_COFFEE) }
}
