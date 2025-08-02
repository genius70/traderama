// Genetic Optimization Engine for Trading Strategies
import { supabase } from '@/integrations/supabase/client';
import { TradingLeg } from '@/components/trading/types';

interface StrategyCondition {
  id: string;
  type: 'entry' | 'exit';
  indicator: string;
  operator: string;
  value: string;
  timeframe: string;
}

interface OptimizationResult {
  bestStrategy: {
    conditions: StrategyCondition[];
    legs: TradingLeg[];
    metrics: {
      returns: number;
      maxDrawdown: number;
      winRate: number;
      sharpeRatio: number;
    };
  };
  generations: number;
  improvements: number;
}

interface OptimizationConfig {
  populationSize: number;
  generations: number;
  mutationRate: number;
}

// Generate initial population for genetic algorithm
const generatePopulation = (
  baseConditions: StrategyCondition[], 
  baseLegs: TradingLeg[], 
  size: number, 
  mutationRate: number
) => {
  return Array.from({ length: size }, () => ({
    conditions: baseConditions.map(c => ({ ...c })),
    legs: baseLegs.map(l => ({ ...l }))
  }));
};

// Select top performing strategies
const selectTopStrategies = (population: any[], count: number) => {
  return population
    .sort((a, b) => b.metrics.returns - a.metrics.returns)
    .slice(0, count);
};

// Crossover function for genetic algorithm
const crossover = (parent1: any, parent2: any) => {
  return {
    conditions: parent1.conditions,
    legs: parent1.legs
  };
};

// Evaluate strategy performance (mock implementation)
const evaluateStrategy = async (auth: any, conditions: StrategyCondition[], legs: TradingLeg[]) => {
  // Mock evaluation - in real implementation would backtest the strategy
  return {
    returns: Math.random() * 100,
    maxDrawdown: Math.random() * 20,
    winRate: Math.random() * 100,
    sharpeRatio: Math.random() * 3
  };
};

export const optimizeStrategy = async (
  auth: any,
  strategy: { conditions: StrategyCondition[]; legs: TradingLeg[] },
  userId: string
): Promise<OptimizationResult> => {
  try {
    const config: OptimizationConfig = {
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

    let bestStrategy = selectTopStrategies(evaluatedPopulation, 1)[0];

    for (let generation = 0; generation < config.generations; generation++) {
      const selected = selectTopStrategies(evaluatedPopulation, Math.floor(config.populationSize / 2));
      const newPopulation = [];
      
      while (newPopulation.length < config.populationSize) {
        const parent1 = selected[Math.floor(Math.random() * selected.length)];
        const parent2 = selected[Math.floor(Math.random() * selected.length)];
        const child = crossover(parent1, parent2);
        newPopulation.push(child);
      }

      const newEvaluated = await Promise.all(
        newPopulation.map(async (individual) => ({
          ...individual,
          metrics: await evaluateStrategy(auth, individual.conditions, individual.legs),
        }))
      );

      population = newEvaluated;
      const generationBest = selectTopStrategies(newEvaluated, 1)[0];
      
      if (generationBest.metrics.returns > bestStrategy.metrics.returns) {
        bestStrategy = generationBest;
      }
    }

    // Save optimization result
    await supabase.from('trading_strategies').insert([
      {
        title: `Optimized Strategy ${Date.now()}`,
        description: 'Genetically optimized trading strategy',
        strategy_config: {
          conditions: bestStrategy.conditions,
          legs: bestStrategy.legs
        },
        performance_metrics: bestStrategy.metrics,
        creator_id: userId,
        status: 'draft'
      }
    ]);

    return {
      bestStrategy,
      generations: config.generations,
      improvements: 1
    };
  } catch (error) {
    console.error('Optimization failed:', error);
    throw error;
  }
};