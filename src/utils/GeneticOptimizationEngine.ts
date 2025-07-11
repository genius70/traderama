// src/utils/GeneticOptimizationEngine.ts
import { supabase } from '@/integrations/supabase/client';
import { StrategyCondition, TradingLeg } from '@/components/trading/CreateStrategy';
import { authenticateIG, placeTrade, IGAuthTokens } from '@/utils/igTradingAPI';

interface PerformanceMetrics {
  returns: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

interface OptimizationResult {
  fitnessScore: number;
  optimizedConditions: StrategyCondition[];
  optimizedLegs: TradingLeg[];
  performanceMetrics: PerformanceMetrics;
}

// Mock backtest implementation (replace with actual IG API backtest)
const evaluateStrategy = async (auth: IGAuthTokens, conditions: StrategyCondition[], legs: TradingLeg[]): Promise<PerformanceMetrics> => {
  try {
    // Simulate backtest by placing test trades with IG API
    for (const leg of legs) {
      await placeTrade(auth, {
        epic: leg.epic,
        size: leg.size,
        direction: leg.buySell,
        orderType: 'MARKET',
        expiry: leg.expiration,
      });
    }
    // Mock metrics (replace with actual backtest results from IG API)
    return {
      returns: Math.random() * 20 + 5,
      sharpeRatio: Math.random() * 2 + 0.5,
      maxDrawdown: Math.random() * 10,
    };
  } catch (error) {
    console.error('Error evaluating strategy:', error);
    throw error;
  }
};

// ... (generatePopulation, selectTopStrategies, crossover remain the same as previous response)

export const optimizeStrategy = async (strategy: { conditions: StrategyCondition[]; legs: TradingLeg[] }): Promise<OptimizationResult> => {
  try {
    const auth = await authenticateIG();
    const config = {
      populationSize: 50,
      generations: 100,
      mutationRate: 0.1,
    };

    let population = generatePopulation(strategy.conditions, strategy.legs, config.populationSize, config.mutationRate);

    const evaluatedPopulation = await Promise.all(
      population.map(async (individual) => ({
        ...individual,
        metrics: await evaluateStrategy(auth, individual.conditions, individual.legs),
      }))
    );

    let bestStrategy = evaluatedPopulation[0];

    for (let generation = 0; generation < config.generations; generation++) {
      const selected = selectTopStrategies(evaluatedPopulation, Math.floor(config.populationSize / 2));
      const newPopulation = [];
      while (newPopulation.length < config.populationSize) {
        const parent1 = selected[Math.floor(Math.random() * selected.length)];
        const parent2 = selected[Math.floor(Math.random() * selected.length)];
        const child = crossover(parent1, parent2);
        newPopulation.push({
          conditions: child.conditions.map((c) => ({
            ...c,
            value: c.operator.includes('crosses') ? c.value : (parseFloat(c.value) * (1 + config.mutationRate * (Math.random() - 0.5))).toFixed(2),
          })),
          legs: child.legs.map((l) => ({
            ...l,
            size: Math.max(1, Math.round(l.size * (1 + config.mutationRate * (Math.random() - 0.5)))),
          })),
        });
      }

      const newEvaluated = await Promise.all(
        newPopulation.map(async (individual) => ({
          ...individual,
          metrics: await evaluateStrategy(auth, individual.conditions, individual.legs),
        }))
      );

      population = newEvaluated;
      const generationBest = selectTopStrategies(newEvaluated, 1)[0];
      if ((generationBest.metrics.returns / (generationBest.metrics.maxDrawdown + 1)) > (bestStrategy.metrics.returns / (bestStrategy.metrics.maxDrawdown + 1))) {
        bestStrategy = generationBest;
      }
    }

    const result: OptimizationResult = {
      fitnessScore: bestStrategy.metrics.returns / (bestStrategy.metrics.maxDrawdown + 1),
      optimizedConditions: bestStrategy.conditions,
      optimizedLegs: bestStrategy.legs,
      performanceMetrics: bestStrategy.metrics,
    };

    const { error } = await supabase
      .from('strategy_optimizations')
      .insert([
        {
          strategy_config: { conditions: result.optimizedConditions, legs: result.optimizedLegs },
          performance_metrics: result.performanceMetrics,
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) throw error;

    return result;
  } catch (error) {
    console.error('Optimization error:', error);
    throw error;
  }
};
