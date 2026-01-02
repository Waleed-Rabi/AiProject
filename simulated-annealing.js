
class SimulatedAnnealing {
    constructor(initialTemp = 1000, coolingRate = 0.95, iterationsPerTemp = 100) {
        this.initialTemp = initialTemp;
        this.coolingRate = coolingRate;
        this.iterationsPerTemp = iterationsPerTemp;
        this.currentTemp = initialTemp;
        this.bestSolution = null;
        this.bestCost = Infinity;
        this.currentSolution = null;
        this.currentCost = Infinity;
    }

    
    calculateDistance(city1, city2) {
        const dx = city1.x - city2.x;
        const dy = city1.y - city2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }


    calculateRouteCost(route, cities, unsafePenalty = 50) {
        let totalCost = 0;
        
        for (let i = 0; i < route.length; i++) {
            const currentCity = cities[route[i]];
            const nextCity = cities[route[(i + 1) % route.length]]; //circular path
            
        
            totalCost += this.calculateDistance(currentCity, nextCity);
            
            
            if (currentCity.isUnsafe) {
                totalCost += unsafePenalty;
            }
        }
        
        return totalCost;
    }

    generateRandomRoute(numCities) {
        const route = Array.from({length: numCities}, (_, i) => i);
        for (let i = route.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [route[i], route[j]] = [route[j], route[i]];
        }
        return route;
    }

    generateNeighbor(route) {
        const newRoute = [...route];
        const i = Math.floor(Math.random() * newRoute.length);
        let j = Math.floor(Math.random() * newRoute.length);
        
      
        while (j === i) {
            j = Math.floor(Math.random() * newRoute.length); // to enure 
        }
        
        [newRoute[i], newRoute[j]] = [newRoute[j], newRoute[i]];
        return newRoute;
    }

    acceptanceProbability(oldCost, newCost, temperature) { //after doing route , we do the acceptance
        if (newCost < oldCost) {
            return 1.0; // better solution
        }
        
     
        const deltaE = newCost - oldCost;// بنقبل اسوء حل بالنسبة لل تيمبريتشر
        return Math.exp(-deltaE / temperature); //فرق التكلفة والاحتمالية
    }


    optimize(cities, unsafePenalty = 50, onProgress = null) {
        const numCities = cities.length;
        
       
        this.currentSolution = this.generateRandomRoute(numCities);
        this.currentCost = this.calculateRouteCost(this.currentSolution, cities, unsafePenalty);
        
        this.bestSolution = [...this.currentSolution];
        this.bestCost = this.currentCost;
        
        this.currentTemp = this.initialTemp;
        
        let iteration = 0;
        const maxIterations = Math.ceil(Math.log(0.01 / this.initialTemp) / Math.log(this.coolingRate)) * this.iterationsPerTemp;
        
        while (this.currentTemp > 0.01) {
            for (let i = 0; i < this.iterationsPerTemp; i++) {
              
                const neighborRoute = this.generateNeighbor(this.currentSolution);
                const neighborCost = this.calculateRouteCost(neighborRoute, cities, unsafePenalty);
                
                
                if (this.acceptanceProbability(this.currentCost, neighborCost, this.currentTemp) > Math.random()) {
                    this.currentSolution = neighborRoute;
                    this.currentCost = neighborCost;
                    
                   
                    if (this.currentCost < this.bestCost) {
                        this.bestSolution = [...this.currentSolution];
                        this.bestCost = this.currentCost;
                    }
                }
                
                iteration++;
                
               
                if (onProgress && iteration % 10 === 0) {
                    const progress = (iteration / maxIterations) * 100;
                    onProgress(progress, this.bestCost, this.currentTemp);
                }
            }
            
          
            this.currentTemp *= this.coolingRate;
        }
        
        return {
            route: this.bestSolution,
            cost: this.bestCost,
            iterations: iteration
        };
    }

    
    reset() {
        this.currentTemp = this.initialTemp;
        this.bestSolution = null;
        this.bestCost = Infinity;
        this.currentSolution = null;
        this.currentCost = Infinity;
    }

   
    getState() {
        return {
            currentTemp: this.currentTemp,
            bestCost: this.bestCost,
            currentCost: this.currentCost
        };
    }
}


class RouteAnalyzer {
    
    static calculateDistance(city1, city2) {
        const dx = city1.x - city2.x;
        const dy = city1.y - city2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // حسابات
    static analyzeRoute(route, cities, unsafePenalty = 50) {
        let totalDistance = 0;
        let totalPenalty = 0;
        let unsafeCities = 0;
        const segments = [];
        
        for (let i = 0; i < route.length; i++) {
            const currentCity = cities[route[i]];
            const nextCity = cities[route[(i + 1) % route.length]];
            
            const distance = Math.sqrt(
                Math.pow(currentCity.x - nextCity.x, 2) + 
                Math.pow(currentCity.y - nextCity.y, 2)
            );
            
            totalDistance += distance;
            
            if (currentCity.isUnsafe) {
                totalPenalty += unsafePenalty;
                unsafeCities++;
            }
            
            segments.push({
                from: currentCity.name,
                to: nextCity.name,
                distance: distance,
                penalty: currentCity.isUnsafe ? unsafePenalty : 0
            });
        }
        
        return {
            totalDistance: totalDistance,
            totalPenalty: totalPenalty,
            totalCost: totalDistance + totalPenalty,
            unsafeCities: unsafeCities,
            segments: segments
        };
    }

    // Compare two routes
    static compareRoutes(route1, route2, cities, unsafePenalty = 50) {
        const analysis1 = this.analyzeRoute(route1, cities, unsafePenalty);
        const analysis2 = this.analyzeRoute(route2, cities, unsafePenalty);
        
        return {
            route1: analysis1,
            route2: analysis2,
            improvement: {
                distance: analysis1.totalDistance - analysis2.totalDistance,
                penalty: analysis1.totalPenalty - analysis2.totalPenalty,
                total: analysis1.totalCost - analysis2.totalCost,
                percentage: ((analysis1.totalCost - analysis2.totalCost) / analysis1.totalCost) * 100
            }
        };
    }
} 