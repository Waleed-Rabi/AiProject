
class DronePlanner {
    constructor() {
        this.cities = [];
        this.weatherData = this.getBuiltInWeatherData();
        this.perceptron = null;
        this.isPerceptronTrained = false;
        this.initialRoute = [];
        this.optimizedRoute = [];
        this.addCityMode = false;
        
        this.initializeEventListeners();
        this.initializeCanvas();
        
        this.toggleManualInputs();
        this.updateSystemStatus();
        
       
        document.getElementById('trainPerceptronBtn').disabled = false;
    }

    initializeEventListeners() {
        
        document.getElementById('generateCitiesBtn').addEventListener('click', () => {
            this.generateCities();
        });

       
        document.getElementById('clearCitiesBtn').addEventListener('click', () => {
            this.clearCities();
        });

        
        document.getElementById('trainPerceptronBtn').addEventListener('click', () => {
            this.trainPerceptron();
        });

        document.getElementById('optimizeRouteBtn').addEventListener('click', () => {
            this.optimizeRoute();
        });

       
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetAll();
        });

       

   
        document.getElementById('addCityBtn').addEventListener('click', () => {
            this.addIndividualCity();
        });

       

   
        document.getElementById('manualWeather').addEventListener('change', () => {
            this.toggleManualInputs();
        });
        document.getElementById('randomWeather').addEventListener('change', () => {
            this.toggleManualInputs();
        });


        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }

    initializeCanvas() {
        this.canvas = document.getElementById('routeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }

   

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth - 40;
        this.canvas.height = 400;
        this.drawRoute();
    }

    toggleManualInputs() {
        const manualWeather = document.getElementById('manualWeather').checked;
        const manualInputs = document.getElementById('manualInputs');
        manualInputs.style.display = manualWeather ? 'block' : 'none';
    }

    updateSystemStatus() {
        const perceptronStatus = document.getElementById('perceptronStatus');
        const citiesStatus = document.getElementById('citiesStatus');
        const routeStatus = document.getElementById('routeStatus');

      
        if (this.isPerceptronTrained) {
            perceptronStatus.innerHTML = '✅ Perceptron: Trained and ready';
            perceptronStatus.style.color = '#27ae60';
        } else {
            perceptronStatus.innerHTML = '❌ Perceptron: Not trained';
            perceptronStatus.style.color = '#e74c3c';
        }

 
        if (this.cities && this.cities.length > 0) {
            citiesStatus.innerHTML = `✅ Cities: ${this.cities.length} generated`;
            citiesStatus.style.color = '#27ae60';
        } else {
            citiesStatus.innerHTML = '❌ Cities: None generated';
            citiesStatus.style.color = '#e74c3c';
        }

    
        if (this.optimizedRoute && this.optimizedRoute.length > 0) {
            routeStatus.innerHTML = '✅ Route: Optimized';
            routeStatus.style.color = '#27ae60';
        } else if (this.initialRoute && this.initialRoute.length > 0) {
            routeStatus.innerHTML = '🔄 Route: Initial route generated';
            routeStatus.style.color = '#f39c12';
        } else {
            routeStatus.innerHTML = '❌ Route: Not optimized';
            routeStatus.style.color = '#e74c3c';
        }
    }

    generateCities() {
        const numCities = parseInt(document.getElementById('numCities').value);
        if (numCities < 3 || numCities > 20) {
            alert('Please enter a number between 3 and 20');
            return;
        }

        this.cities = [];
        const canvas = document.getElementById('routeCanvas');
        const ctx = canvas.getContext('2d');
        
        
        const useManualWeather = document.getElementById('manualWeather').checked;
        
       
        const minX = 50;
        const maxX = 550;
        const minY = 50;
        const maxY = 350;
        
        const minTemp = useManualWeather ? parseInt(document.getElementById('minTemp').value) : -10;
        const maxTemp = useManualWeather ? parseInt(document.getElementById('maxTemp').value) : 40;
        const minHumidity = useManualWeather ? parseInt(document.getElementById('minHumidity').value) : 20;
        const maxHumidity = useManualWeather ? parseInt(document.getElementById('maxHumidity').value) : 90;
        const minWind = useManualWeather ? parseInt(document.getElementById('minWind').value) : 0;
        const maxWind = useManualWeather ? parseInt(document.getElementById('maxWind').value) : 50;

        for (let i = 0; i < numCities; i++) {
            const city = {
                name: `City ${i + 1}`,
                x: Math.random() * (maxX - minX) + minX,
                y: Math.random() * (maxY - minY) + minY,
                temperature: Math.random() * (maxTemp - minTemp) + minTemp,
                humidity: Math.random() * (maxHumidity - minHumidity) + minHumidity,
                windSpeed: Math.random() * (maxWind - minWind) + minWind,
                isUnsafe: false
            };
            
            this.cities.push(city);

            
            if (this.perceptron && this.weatherData.length > 0) {
                this.predictWeatherSafety(this.cities.length - 1);
            }
        }

        this.renderCities();
        this.generateInitialRoute();
        this.drawRoute();
        this.updateRouteInfo();
        this.updateSystemStatus();
    }

    renderCities() {
        const container = document.getElementById('citiesContainer');
        if (!this.cities || this.cities.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #6c757d;">No cities generated yet. Click "Generate Cities" to start.</p>';
            return;
        }

        container.innerHTML = this.cities.map((city, index) => `
            <div class="city-item">
                <div class="city-header">
                    <span class="city-name">${city.name}</span>
                    <span class="weather-status ${city.isUnsafe ? 'status-unsafe' : 'status-safe'}">
                        ${city.isUnsafe ? '⚠️ Unsafe' : '✅ Safe'}
                    </span>
                </div>
                
                <div class="city-coords">
                    <div>
                        <label>X: <input type="number" value="${Math.round(city.x)}" 
                            onchange="dronePlanner.updateCityCoord(${index}, 'x', this.value)"></label>
                    </div>
                    <div>
                        <label>Y: <input type="number" value="${Math.round(city.y)}" 
                            onchange="dronePlanner.updateCityCoord(${index}, 'y', this.value)"></label>
                    </div>
                </div>
                
                <div class="city-weather">
                    <div>
                        <label>Temp (°C): <input type="number" value="${city.temperature.toFixed(1)}" 
                            onchange="dronePlanner.updateCityWeather(${index}, 'temperature', this.value)"></label>
                    </div>
                    <div>
                        <label>Humidity (%): <input type="number" value="${city.humidity.toFixed(1)}" 
                            onchange="dronePlanner.updateCityWeather(${index}, 'humidity', this.value)"></label>
                    </div>
                    <div>
                        <label>Wind (km/h): <input type="number" value="${city.windSpeed.toFixed(1)}" 
                            onchange="dronePlanner.updateCityWeather(${index}, 'windSpeed', this.value)"></label>
                    </div>
                </div>
                
                <div style="margin-top: 10px;">
                    <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;" 
                        onclick="dronePlanner.handleUpdatePrediction(${index})">
                        🔄 Update Prediction
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateCityWeather(index, weather, value) {
        if (index >= 0 && index < this.cities.length) {
            this.cities[index][weather] = parseFloat(value);
            
            this.predictWeatherSafety(index);
            this.renderCities();
            this.drawRoute();
            this.updateRouteInfo();
            this.updateSystemStatus();
        }
    }

    updateCityCoord(index, coord, value) {
        if (index >= 0 && index < this.cities.length) {
            this.cities[index][coord] = parseFloat(value);
            this.drawRoute();
            this.updateRouteInfo();
            this.updateSystemStatus();
        }
    }

    handleUpdatePrediction(index) {
        this.predictWeatherSafety(index);
        this.renderCities();
        this.drawRoute();
        this.updateRouteInfo();
        this.updateSystemStatus();
    }

    predictWeatherSafety(index) {
        if (!this.perceptron) return;
        
        const city = this.cities[index];
        const features = [city.temperature, city.humidity, city.windSpeed];
        const normalizedFeatures = this.normalizeFeatures(features);
        const prediction = this.perceptron.predict(normalizedFeatures);
        
        city.isUnsafe = prediction === 1;
        
        const statusElement = document.getElementById(`status-${index}`);
        if (statusElement) {
            statusElement.className = `weather-status ${city.isUnsafe ? 'status-unsafe' : 'status-safe'}`;
            statusElement.textContent = city.isUnsafe ? '⚠️ Unsafe' : '✅ Safe';
        }
    }

    normalizeFeatures(features) {
        if (!this.weatherData || this.weatherData.length === 0) return features;
        
        const mins = this.normMins ? this.normMins : [
            Math.min(...this.weatherData.map(row => row.Temperature)),
            Math.min(...this.weatherData.map(row => row.Humidity)),
            Math.min(...this.weatherData.map(row => row['Wind Speed']))
        ];
        const maxs = this.normMaxs ? this.normMaxs : [
            Math.max(...this.weatherData.map(row => row.Temperature)),
            Math.max(...this.weatherData.map(row => row.Humidity)),
            Math.max(...this.weatherData.map(row => row['Wind Speed']))
        ];
        
        return features.map((v, j) => {
            if (maxs[j] === mins[j]) return 0;
            return (v - mins[j]) / (maxs[j] - mins[j]);
        });
    }

    generateInitialRoute() {
        this.initialRoute = Array.from({length: this.cities.length}, (_, i) => i);
        for (let i = this.initialRoute.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.initialRoute[i], this.initialRoute[j]] = [this.initialRoute[j], this.initialRoute[i]];
        }
    }

    async trainPerceptron() {
        if (!this.weatherData || this.weatherData.length === 0) {
            alert('Weather data not available');
            return;
        }

        const loading = document.getElementById('loading');
        loading.style.display = 'block';

        try {
            const X = this.weatherData.map(row => [row.Temperature, row.Humidity, row['Wind Speed']]);
            const y = this.weatherData.map(row => row.SafeToFly);
            
            console.log('Weather data sample:', this.weatherData[0]);
            console.log('Features sample:', X[0]);
            console.log('Labels sample:', y[0]);
            console.log('Total samples:', X.length);
            
            if (X.length === 0 || X[0].length !== 3) {
                throw new Error('Invalid data format. Expected Temperature, Humidity, and Wind Speed columns.');
            }
            
            const indices = Array.from({ length: X.length }, (_, i) => i);
            for (let i = indices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [indices[i], indices[j]] = [indices[j], indices[i]];
            }

            const splitIndex = Math.floor(0.8 * indices.length);
            const trainIdx = indices.slice(0, splitIndex);
            const testIdx = indices.slice(splitIndex);

            const X_train = trainIdx.map(i => X[i]);
            const y_train = trainIdx.map(i => y[i]);
            const X_test = testIdx.map(i => X[i]);
            const y_test = testIdx.map(i => y[i]);

            this.normMins = [
                Math.min(...X_train.map(r => r[0])),
                Math.min(...X_train.map(r => r[1])),
                Math.min(...X_train.map(r => r[2]))
            ];
            this.normMaxs = [
                Math.max(...X_train.map(r => r[0])),
                Math.max(...X_train.map(r => r[1])),
                Math.max(...X_train.map(r => r[2]))
            ];

            const normalizeRow = (row) => row.map((v, j) => {
                const min = this.normMins[j];
                const max = this.normMaxs[j];
                if (max === min) return 0;
                return (v - min) / (max - min);
            });

            const Xn_train = X_train.map(r => normalizeRow(r));
            const Xn_test = X_test.map(r => normalizeRow(r));

            this.perceptron = new Perceptron(3, 0.1);
            this.perceptron.train(Xn_train, y_train, 200);

            let correct = 0;
            for (let i = 0; i < Xn_test.length; i++) {
                const pred = this.perceptron.predict(Xn_test[i]);
                if (pred === y_test[i]) correct++;
            }
            const accuracy = Xn_test.length > 0 ? (correct / Xn_test.length) : 0;
            
            this.isPerceptronTrained = true;
            
            if (this.cities && this.cities.length > 0) {
                this.cities.forEach((city, index) => {
                    this.predictWeatherSafety(index);
                });
                this.renderCities();
                this.updateRouteInfo();
                this.updateSystemStatus();
            }
            
            alert(`✅ Perceptron trained on 80% of data. Test accuracy (20%): ${(accuracy * 100).toFixed(1)}%`);
            
        } catch (error) {
            alert(`❌ Error training perceptron: ${error.message}`);
        } finally {
            loading.style.display = 'none';
        }
    }

    async optimizeRoute() {
        if (this.cities.length === 0) {
            alert('Please generate cities first');
            return;
        }

        if (!this.isPerceptronTrained) {
            alert('Please train the perceptron first');
            return;
        }

        const loading = document.getElementById('loading');
        loading.style.display = 'block';

        try {
            const initialTemp = parseFloat(document.getElementById('initialTemp').value);
            const coolingRate = parseFloat(document.getElementById('coolingRate').value);
            const iterations = 100; 
            const unsafePenalty = 50;

            
            this.simulatedAnnealing = new SimulatedAnnealing(initialTemp, coolingRate, iterations);

            const result = await this.runOptimization(unsafePenalty);
            
            this.optimizedRoute = result.route;
            
            this.drawRoute();
            this.updateRouteInfo();
            this.updateSystemStatus();
            
            alert(`✅ Route optimized! Cost reduced from ${result.initialCost.toFixed(2)} to ${result.cost.toFixed(2)}`);
            
        } catch (error) {
            alert(`❌ Error optimizing route: ${error.message}`);
        } finally {
            loading.style.display = 'none';
        }
    }

    runOptimization(unsafePenalty) {
        return new Promise((resolve) => {
            const initialCost = RouteAnalyzer.analyzeRoute(this.initialRoute, this.cities, unsafePenalty).totalCost;
            
            const result = this.simulatedAnnealing.optimize(
                this.cities, 
                unsafePenalty,
                (progress, bestCost, temperature) => {
                }
            );
            
            resolve({
                ...result,
                initialCost: initialCost
            });
        });
    }

    drawRoute() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (this.cities.length === 0) return;
        
        this.cities.forEach((city, index) => {
            ctx.beginPath();
            ctx.arc(city.x, city.y, 8, 0, 2 * Math.PI);
            ctx.fillStyle = city.isUnsafe ? '#e74c3c' : '#27ae60';
            ctx.fill();
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.fillStyle = '#2c3e50';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(city.name, city.x, city.y - 15);
        });
        
        if (this.initialRoute.length > 0) {
            this.drawRoutePath(this.initialRoute, '#f39c12', 2, 'dashed');
        }
        
        if (this.optimizedRoute.length > 0) {
            this.drawRoutePath(this.optimizedRoute, '#3498db', 3, 'solid');
        }
    }

    drawRoutePath(route, color, lineWidth, lineStyle) {
        const ctx = this.ctx;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.setLineDash(lineStyle === 'dashed' ? [10, 5] : []);
        
        ctx.beginPath();
        for (let i = 0; i < route.length; i++) {
            const city = this.cities[route[i]];
            if (i === 0) {
                ctx.moveTo(city.x, city.y);
            } else {
                ctx.lineTo(city.x, city.y);
            }
        }
        const firstCity = this.cities[route[0]];
        ctx.lineTo(firstCity.x, firstCity.y);
        
        ctx.stroke();
        ctx.setLineDash([]);

	        ctx.save();
	        ctx.font = '10px Arial';
	        ctx.textAlign = 'center';
	        ctx.textBaseline = 'middle';
	        for (let i = 0; i < route.length; i++) {
	            const fromCity = this.cities[route[i]];
	            const toCity = this.cities[(route[(i + 1) % route.length])];
	            const distance = RouteAnalyzer.calculateDistance(fromCity, toCity);
	            const label = distance.toFixed(1);
	            const mx = (fromCity.x + toCity.x) / 2;
	            const my = (fromCity.y + toCity.y) / 2;
	            const padding = 2;
	            const width = ctx.measureText(label).width;
	            ctx.fillStyle = 'rgba(255,255,255,0.85)';
	            ctx.fillRect(mx - width / 2 - padding, my - 7, width + padding * 2, 12);
	            ctx.fillStyle = color;
	            ctx.fillText(label, mx, my);
	        }
	        ctx.restore();
    }

    updateRouteInfo() {
        if (this.cities.length === 0) {
            document.getElementById('routeDetails').textContent = 'Click "Generate Cities" to start';
            return;
        }

        const unsafePenalty = 50;
        
        if (this.initialRoute.length > 0) {
            const initialAnalysis = RouteAnalyzer.analyzeRoute(this.initialRoute, this.cities, unsafePenalty);
            document.getElementById('initialCost').textContent = initialAnalysis.totalCost.toFixed(2);
            
            let details = `Initial Route: ${initialAnalysis.totalDistance.toFixed(2)} km + ${initialAnalysis.totalPenalty.toFixed(2)} penalty = ${initialAnalysis.totalCost.toFixed(2)} total`;
            
            if (this.optimizedRoute.length > 0) {
                const optimizedAnalysis = RouteAnalyzer.analyzeRoute(this.optimizedRoute, this.cities, unsafePenalty);
                document.getElementById('optimizedCost').textContent = optimizedAnalysis.totalCost.toFixed(2);
                
                const comparison = RouteAnalyzer.compareRoutes(this.initialRoute, this.optimizedRoute, this.cities, unsafePenalty);
                details += `<br><br>Optimized Route: ${optimizedAnalysis.totalDistance.toFixed(2)} km + ${optimizedAnalysis.totalPenalty.toFixed(2)} penalty = ${optimizedAnalysis.totalCost.toFixed(2)} total`;
                details += `<br><br>Improvement: ${comparison.improvement.percentage.toFixed(1)}% reduction (${comparison.improvement.total.toFixed(2)} cost saved)`;
            }
            
            document.getElementById('routeDetails').innerHTML = details;
        }
    }

    showSegmentBreakdown(route, cities, unsafePenalty) {
        const segmentDetails = document.getElementById('segmentDetails');
        
        let breakdownHTML = '<table style="width: 100%; border-collapse: collapse; font-size: 12px;">';
        breakdownHTML += '<thead><tr style="background: #d1ecf1;"><th style="padding: 8px; border: 1px solid #bee5eb;">From</th><th style="padding: 8px; border: 1px solid #bee5eb;">To</th><th style="padding: 8px; border: 1px solid #bee5eb;">Distance (km)</th><th style="padding: 8px; border: 1px solid #bee5eb;">Weather Penalty</th><th style="padding: 8px; border: 1px solid #bee5eb;">Segment Cost</th></tr></thead><tbody>';
        
        let totalDistance = 0;
        let totalPenalty = 0;
        
        for (let i = 0; i < route.length; i++) {
            const currentCity = cities[route[i]];
            const nextCity = cities[route[(i + 1) % route.length]];
            
            const distance = RouteAnalyzer.calculateDistance(currentCity, nextCity);
            const penalty = currentCity.isUnsafe ? unsafePenalty : 0;
            const segmentCost = distance + penalty;
            
            totalDistance += distance;
            totalPenalty += penalty;
            
            const weatherStatus = currentCity.isUnsafe ? '🔴 Unsafe (+' + unsafePenalty + ')' : '🟢 Safe (0)';
            
            breakdownHTML += `<tr style="border-bottom: 1px solid #bee5eb;">`;
            breakdownHTML += `<td style="padding: 8px; border: 1px solid #bee5eb;">${currentCity.name}</td>`;
            breakdownHTML += `<td style="padding: 8px; border: 1px solid #bee5eb;">${nextCity.name}</td>`;
            breakdownHTML += `<td style="padding: 8px; border: 1px solid #bee5eb; text-align: right;">${distance.toFixed(2)}</td>`;
            breakdownHTML += `<td style="padding: 8px; border: 1px solid #bee5eb; text-align: center;">${weatherStatus}</td>`;
            breakdownHTML += `<td style="padding: 8px; border: 1px solid #bee5eb; text-align: right; font-weight: bold;">${segmentCost.toFixed(2)}</td>`;
            breakdownHTML += `</tr>`;
        }
        
        breakdownHTML += `<tr style="background: #d1ecf1; font-weight: bold;">`;
        breakdownHTML += `<td colspan="2" style="padding: 8px; border: 1px solid #bee5eb;">TOTAL</td>`;
        breakdownHTML += `<td style="padding: 8px; border: 1px solid #bee5eb; text-align: right;">${totalDistance.toFixed(2)}</td>`;
        breakdownHTML += `<td style="padding: 8px; border: 1px solid #bee5eb; text-align: center;">${totalPenalty.toFixed(2)}</td>`;
        breakdownHTML += `<td style="padding: 8px; border: 1px solid #bee5eb; text-align: right;">${(totalDistance + totalPenalty).toFixed(2)}</td>`;
        breakdownHTML += `</tr>`;
        
        breakdownHTML += '</tbody></table>';
        
        segmentDetails.innerHTML += breakdownHTML;
    }

    showInitialRouteBreakdown(route, cities, unsafePenalty) {
        const segmentBreakdown = document.getElementById('segmentBreakdown');
        const segmentDetails = document.getElementById('segmentDetails');
        
        segmentBreakdown.style.display = 'block';
        
        let breakdownHTML = '<h5 style="margin: 0 0 10px 0; color: #e67e22;">🟠 Initial Route Breakdown</h5>';
        breakdownHTML += '<table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px;">';
        breakdownHTML += '<thead><tr style="background: #fff3cd;"><th style="padding: 8px; border: 1px solid #ffeaa7;">From</th><th style="padding: 8px; border: 1px solid #ffeaa7;">To</th><th style="padding: 8px; border: 1px solid #ffeaa7;">Distance (km)</th><th style="padding: 8px; border: 1px solid #ffeaa7;">Weather Penalty</th><th style="padding: 8px; border: 1px solid #ffeaa7;">Segment Cost</th></tr></thead><tbody>';
        
        let totalDistance = 0;
        let totalPenalty = 0;
        
        for (let i = 0; i < route.length; i++) {
            const currentCity = cities[route[i]];
            const nextCity = cities[route[(i + 1) % route.length]];
            
            const distance = RouteAnalyzer.calculateDistance(currentCity, nextCity);
            const penalty = currentCity.isUnsafe ? unsafePenalty : 0;
            const segmentCost = distance + penalty;
            
            totalDistance += distance;
            totalPenalty += penalty;
            
            const weatherStatus = currentCity.isUnsafe ? '🔴 Unsafe (+' + unsafePenalty + ')' : '🟢 Safe (0)';
            
            breakdownHTML += `<tr style="border-bottom: 1px solid #ffeaa7;">`;
            breakdownHTML += `<td style="padding: 8px; border: 1px solid #ffeaa7;">${currentCity.name}</td>`;
            breakdownHTML += `<td style="padding: 8px; border: 1px solid #ffeaa7;">${nextCity.name}</td>`;
            breakdownHTML += `<td style="padding: 8px; border: 1px solid #ffeaa7; text-align: right;">${distance.toFixed(2)}</td>`;
            breakdownHTML += `<td style="padding: 8px; border: 1px solid #ffeaa7; text-align: center;">${weatherStatus}</td>`;
            breakdownHTML += `<td style="padding: 8px; border: 1px solid #ffeaa7; text-align: right; font-weight: bold;">${segmentCost.toFixed(2)}</td>`;
            breakdownHTML += `</tr>`;
        }
        
        breakdownHTML += `<tr style="background: #fff3cd; font-weight: bold;">`;
        breakdownHTML += `<td colspan="2" style="padding: 8px; border: 1px solid #ffeaa7;">TOTAL</td>`;
        breakdownHTML += `<td style="padding: 8px; border: 1px solid #ffeaa7; text-align: right;">${totalDistance.toFixed(2)}</td>`;
        breakdownHTML += `<td style="padding: 8px; border: 1px solid #ffeaa7; text-align: center;">${totalPenalty.toFixed(2)}</td>`;
        breakdownHTML += `<td style="padding: 8px; border: 1px solid #ffeaa7; text-align: right;">${(totalDistance + totalPenalty).toFixed(2)}</td>`;
        breakdownHTML += `</tr>`;
        
        breakdownHTML += '</tbody></table>';
        
        breakdownHTML += '<h5 style="margin: 0 0 10px 0; color: #3498db;">🔵 Optimized Route Breakdown</h5>';
        
        segmentDetails.innerHTML = breakdownHTML;
    }

    clearCities() {
        this.cities = [];
        this.initialRoute = [];
        this.optimizedRoute = [];
        this.renderCities();
        this.drawRoute();
        this.updateRouteInfo();
        this.updateSystemStatus();
    }

    resetAll() {
        this.cities = [];
        this.weatherData = this.getBuiltInWeatherData();
        this.perceptron = null;
        this.isPerceptronTrained = false;
        this.initialRoute = [];
        this.optimizedRoute = [];
        this.addCityMode = false;
        
        
        document.getElementById('trainPerceptronBtn').disabled = false;
        
        this.renderCities();
        this.drawRoute();
        this.updateRouteInfo();
        this.updateSystemStatus();
    }

    addIndividualCity() {
        const x = parseFloat(document.getElementById('newCityX').value);
        const y = parseFloat(document.getElementById('newCityY').value);
        const temperature = parseFloat(document.getElementById('newCityTemp').value);
        const humidity = parseFloat(document.getElementById('newCityHumidity').value);
        const windSpeed = parseFloat(document.getElementById('newCityWind').value);

     
        if (isNaN(x) || isNaN(y) || isNaN(temperature) || isNaN(humidity) || isNaN(windSpeed)) {
            alert('Please fill in all fields with valid numbers.');
            return;
        }

        
        const canvas = document.getElementById('routeCanvas');
        if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
            alert('Coordinates must be within the canvas bounds (0-600 for X, 0-400 for Y).');
            return;
        }

        const newCity = {
            name: `City ${this.cities.length + 1}`,
            x: x,
            y: y,
            temperature: temperature,
            humidity: humidity,
            windSpeed: windSpeed,
            isUnsafe: false
        };

        this.cities.push(newCity);

        
        if (this.perceptron && this.weatherData.length > 0) {
            this.predictWeatherSafety(this.cities.length - 1);
        }
        
       
        document.getElementById('newCityX').value = '';
        document.getElementById('newCityY').value = '';
        document.getElementById('newCityTemp').value = '';
        document.getElementById('newCityHumidity').value = '';
        document.getElementById('newCityWind').value = '';
        
        this.renderCities();
        this.drawRoute();
        this.updateRouteInfo();
        this.updateSystemStatus();
    }

    addCityAtClick(e) {
        const canvas = document.getElementById('routeCanvas');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
            alert('Please click within the canvas bounds.');
            return;
        }

        const newCity = {
            name: `City ${this.cities.length + 1}`,
            x: x,
            y: y,
            temperature: 20, 
            humidity: 50,
            windSpeed: 10, 
            isUnsafe: false
        };

        this.cities.push(newCity);

        
        if (this.perceptron && this.weatherData.length > 0) {
            this.predictWeatherSafety(this.cities.length - 1);
        }
        
        this.renderCities();
        this.drawRoute();
        this.updateRouteInfo();
        this.updateSystemStatus();
    }

    toggleClickMode() {
        this.addCityMode = !this.addCityMode;
        const toggleBtn = document.getElementById('toggleClickModeBtn');
        const canvas = document.getElementById('routeCanvas');
        const manualInputs = document.getElementById('manualInputs');
        const addCityBtn = document.getElementById('addCityBtn');

        if (this.addCityMode) {
            toggleBtn.textContent = '🖱️ Disable Click Mode';
            toggleBtn.className = 'btn btn-warning';
            canvas.style.cursor = 'crosshair';
            manualInputs.style.display = 'none';
            addCityBtn.style.display = 'none';
        } else {
            toggleBtn.textContent = '🖱️ Enable Click to Add Cities';
            toggleBtn.className = 'btn btn-secondary';
            canvas.style.cursor = 'default';
            manualInputs.style.display = 'block';
            addCityBtn.style.display = 'block';
        }
    }

    toggleDistanceLabels() {
        this.showDistanceLabels = !this.showDistanceLabels;
        const toggleBtn = document.getElementById('toggleDistanceLabelsBtn');
        
        if (this.showDistanceLabels) {
            toggleBtn.textContent = '📏 Hide Distance Labels';
            toggleBtn.className = 'btn btn-warning';
        } else {
            toggleBtn.textContent = '📏 Show Distance Labels';
            toggleBtn.className = 'btn btn-secondary';
        }
        
        this.drawRoute(); 
    }

    
    getBuiltInWeatherData() {
        return [
            {Temperature: 24.36, Humidity: 58.52, "Wind Speed": 8.09, SafeToFly: 0},
            {Temperature: 38.77, Humidity: 25.05, "Wind Speed": 32.08, SafeToFly: 1},
            {Temperature: 33.3, Humidity: 29.7, "Wind Speed": 20.16, SafeToFly: 1},
            {Temperature: 29.97, Humidity: 73.91, "Wind Speed": 29.79, SafeToFly: 1},
            {Temperature: 18.9, Humidity: 56.39, "Wind Speed": 14.6, SafeToFly: 0},
            {Temperature: 18.9, Humidity: 20.55, "Wind Speed": 31.87, SafeToFly: 1},
            {Temperature: 16.45, Humidity: 26.09, "Wind Speed": 16.68, SafeToFly: 0},
            {Temperature: 36.65, Humidity: 59.81, "Wind Speed": 5.33, SafeToFly: 1},
            {Temperature: 30.03, Humidity: 20.3, "Wind Speed": 32.16, SafeToFly: 1},
            {Temperature: 32.7, Humidity: 29.65, "Wind Speed": 7.74, SafeToFly: 1},
            {Temperature: 15.51, Humidity: 52.92, "Wind Speed": 14.58, SafeToFly: 0},
            {Temperature: 39.25, Humidity: 61.51, "Wind Speed": 33.5, SafeToFly: 1},
            {Temperature: 35.81, Humidity: 59.12, "Wind Speed": 33.52, SafeToFly: 1},
            {Temperature: 20.31, Humidity: 33.46, "Wind Speed": 22.2, SafeToFly: 0},
            {Temperature: 19.55, Humidity: 62.73, "Wind Speed": 23.96, SafeToFly: 0},
            {Temperature: 19.59, Humidity: 34.23, "Wind Speed": 18.45, SafeToFly: 0},
            {Temperature: 22.61, Humidity: 39.52, "Wind Speed": 13.8, SafeToFly: 0},
            {Temperature: 28.12, Humidity: 64.79, "Wind Speed": 14.86, SafeToFly: 0},
            {Temperature: 25.8, Humidity: 58.98, "Wind Speed": 25.18, SafeToFly: 1},
            {Temperature: 22.28, Humidity: 70.95, "Wind Speed": 27.57, SafeToFly: 1},
            {Temperature: 30.3, Humidity: 59.46, "Wind Speed": 28.75, SafeToFly: 1},
            {Temperature: 18.49, Humidity: 54.1, "Wind Speed": 28.69, SafeToFly: 1},
            {Temperature: 22.3, Humidity: 25.62, "Wind Speed": 7.74, SafeToFly: 0},
            {Temperature: 24.16, Humidity: 42.06, "Wind Speed": 19.83, SafeToFly: 0},
            {Temperature: 26.4, Humidity: 35.91, "Wind Speed": 6.73, SafeToFly: 0},
            {Temperature: 34.63, Humidity: 34.64, "Wind Speed": 21.49, SafeToFly: 1},
            {Temperature: 19.99, Humidity: 78.38, "Wind Speed": 18.25, SafeToFly: 0},
            {Temperature: 27.86, Humidity: 43.59, "Wind Speed": 31.63, SafeToFly: 1},
            {Temperature: 29.81, Humidity: 73.52, "Wind Speed": 15.53, SafeToFly: 0},
            {Temperature: 16.16, Humidity: 57.87, "Wind Speed": 8.51, SafeToFly: 0},
            {Temperature: 30.19, Humidity: 67.69, "Wind Speed": 9.29, SafeToFly: 1},
            {Temperature: 19.26, Humidity: 50.16, "Wind Speed": 27.85, SafeToFly: 1},
            {Temperature: 16.63, Humidity: 54.61, "Wind Speed": 23.55, SafeToFly: 0},
            {Temperature: 38.72, Humidity: 49.55, "Wind Speed": 8.03, SafeToFly: 1},
            {Temperature: 39.14, Humidity: 31.71, "Wind Speed": 7.52, SafeToFly: 1},
            {Temperature: 35.21, Humidity: 63.35, "Wind Speed": 26.03, SafeToFly: 1},
            {Temperature: 22.62, Humidity: 36.85, "Wind Speed": 7.18, SafeToFly: 0},
            {Temperature: 17.44, Humidity: 21.46, "Wind Speed": 29.66, SafeToFly: 1},
            {Temperature: 32.11, Humidity: 58.73, "Wind Speed": 26.19, SafeToFly: 1},
            {Temperature: 26, Humidity: 30.63, "Wind Speed": 7.44, SafeToFly: 0},
            {Temperature: 18.05, Humidity: 76.43, "Wind Speed": 7.55, SafeToFly: 0},
            {Temperature: 27.38, Humidity: 77.24, "Wind Speed": 34.6, SafeToFly: 1},
            {Temperature: 15.86, Humidity: 74.89, "Wind Speed": 16.23, SafeToFly: 0},
            {Temperature: 37.73, Humidity: 42.21, "Wind Speed": 16.12, SafeToFly: 1},
            {Temperature: 21.47, Humidity: 20.93, "Wind Speed": 29.38, SafeToFly: 1},
            {Temperature: 31.56, Humidity: 75.7, "Wind Speed": 33.42, SafeToFly: 1},
            {Temperature: 22.79, Humidity: 45.69, "Wind Speed": 34.58, SafeToFly: 1},
            {Temperature: 28, Humidity: 78, "Wind Speed": 27.6, SafeToFly: 1},
            {Temperature: 28.67, Humidity: 77.82, "Wind Speed": 16.29, SafeToFly: 0},
            {Temperature: 19.62, Humidity: 71.18, "Wind Speed": 7.51, SafeToFly: 0},
            {Temperature: 39.24, Humidity: 37.67, "Wind Speed": 28.31, SafeToFly: 1},
            {Temperature: 34.38, Humidity: 43.11, "Wind Speed": 21.75, SafeToFly: 1},
            {Temperature: 38.49, Humidity: 71.07, "Wind Speed": 17.73, SafeToFly: 1},
            {Temperature: 37.37, Humidity: 39.02, "Wind Speed": 32.19, SafeToFly: 1},
            {Temperature: 29.95, Humidity: 30.17, "Wind Speed": 8.34, SafeToFly: 0},
            {Temperature: 38.05, Humidity: 53.41, "Wind Speed": 19.78, SafeToFly: 1},
            {Temperature: 17.21, Humidity: 76.17, "Wind Speed": 5.34, SafeToFly: 0},
            {Temperature: 19.9, Humidity: 61.76, "Wind Speed": 19.06, SafeToFly: 0},
            {Temperature: 16.13, Humidity: 54.2, "Wind Speed": 6.69, SafeToFly: 0},
            {Temperature: 23.13, Humidity: 25.83, "Wind Speed": 8.56, SafeToFly: 0},
            {Temperature: 24.72, Humidity: 56.9, "Wind Speed": 8.53, SafeToFly: 0},
            {Temperature: 21.78, Humidity: 79.4, "Wind Speed": 24.48, SafeToFly: 0},
            {Temperature: 35.72, Humidity: 28.41, "Wind Speed": 27.38, SafeToFly: 1},
            {Temperature: 23.92, Humidity: 51.1, "Wind Speed": 22.5, SafeToFly: 0},
            {Temperature: 22.02, Humidity: 72.64, "Wind Speed": 33.87, SafeToFly: 1},
            {Temperature: 28.57, Humidity: 64.45, "Wind Speed": 16.25, SafeToFly: 0},
            {Temperature: 18.52, Humidity: 61.82, "Wind Speed": 13.57, SafeToFly: 0},
            {Temperature: 35.05, Humidity: 62.15, "Wind Speed": 31.06, SafeToFly: 1},
            {Temperature: 16.86, Humidity: 41.57, "Wind Speed": 11.71, SafeToFly: 0},
            {Temperature: 39.67, Humidity: 37.62, "Wind Speed": 33.9, SafeToFly: 1},
            {Temperature: 34.31, Humidity: 68.56, "Wind Speed": 5.36, SafeToFly: 1},
            {Temperature: 19.97, Humidity: 68.61, "Wind Speed": 34.1, SafeToFly: 1},
            {Temperature: 15.14, Humidity: 72.02, "Wind Speed": 6.29, SafeToFly: 0},
            {Temperature: 35.39, Humidity: 74.79, "Wind Speed": 31.73, SafeToFly: 1},
            {Temperature: 32.67, Humidity: 50.68, "Wind Speed": 20.83, SafeToFly: 1},
            {Temperature: 33.23, Humidity: 50.09, "Wind Speed": 34.79, SafeToFly: 1},
            {Temperature: 34.28, Humidity: 67.9, "Wind Speed": 7.21, SafeToFly: 1},
            {Temperature: 16.85, Humidity: 59, "Wind Speed": 21.62, SafeToFly: 0},
            {Temperature: 23.96, Humidity: 62.12, "Wind Speed": 34.08, SafeToFly: 1},
            {Temperature: 17.9, Humidity: 67.75, "Wind Speed": 20.69, SafeToFly: 0},
            {Temperature: 36.58, Humidity: 73.4, "Wind Speed": 23.88, SafeToFly: 1},
            {Temperature: 30.58, Humidity: 40.28, "Wind Speed": 25.87, SafeToFly: 1},
            {Temperature: 23.27, Humidity: 42.53, "Wind Speed": 18.64, SafeToFly: 0},
            {Temperature: 16.59, Humidity: 25.64, "Wind Speed": 23.83, SafeToFly: 0},
            {Temperature: 22.77, Humidity: 54.7, "Wind Speed": 22.53, SafeToFly: 0},
            {Temperature: 23.13, Humidity: 22.16, "Wind Speed": 32.03, SafeToFly: 1},
            {Temperature: 33.24, Humidity: 47.94, "Wind Speed": 6.36, SafeToFly: 1},
            {Temperature: 30.94, Humidity: 52.56, "Wind Speed": 13.43, SafeToFly: 1},
            {Temperature: 37.18, Humidity: 37.19, "Wind Speed": 33.51, SafeToFly: 1},
            {Temperature: 26.81, Humidity: 55.45, "Wind Speed": 31.71, SafeToFly: 1},
            {Temperature: 17.99, Humidity: 21.83, "Wind Speed": 18.67, SafeToFly: 0},
            {Temperature: 32.83, Humidity: 22.24, "Wind Speed": 23.6, SafeToFly: 1},
            {Temperature: 34.02, Humidity: 69.36, "Wind Speed": 13.32, SafeToFly: 1},
            {Temperature: 29.03, Humidity: 41.61, "Wind Speed": 10.64, SafeToFly: 0},
            {Temperature: 34.27, Humidity: 27.62, "Wind Speed": 18.91, SafeToFly: 1},
            {Temperature: 27.34, Humidity: 51.33, "Wind Speed": 15.6, SafeToFly: 0},
            {Temperature: 28.07, Humidity: 66.2, "Wind Speed": 22.51, SafeToFly: 0},
            {Temperature: 25.69, Humidity: 32.95, "Wind Speed": 7.33, SafeToFly: 0},
            {Temperature: 15.64, Humidity: 57.37, "Wind Speed": 34.23, SafeToFly: 1},
            {Temperature: 17.7, Humidity: 25.12, "Wind Speed": 34.59, SafeToFly: 1},
            {Temperature: 15.79, Humidity: 23.1, "Wind Speed": 25.94, SafeToFly: 1},
            {Temperature: 30.91, Humidity: 51.88, "Wind Speed": 21.08, SafeToFly: 1},
            {Temperature: 22.86, Humidity: 52.44, "Wind Speed": 14.29, SafeToFly: 0},
            {Temperature: 27.71, Humidity: 58.25, "Wind Speed": 29.41, SafeToFly: 1},
            {Temperature: 37.69, Humidity: 63.57, "Wind Speed": 25.54, SafeToFly: 1},
            {Temperature: 21.23, Humidity: 78.55, "Wind Speed": 9.88, SafeToFly: 0},
            {Temperature: 25.26, Humidity: 50.98, "Wind Speed": 32.33, SafeToFly: 1},
            {Temperature: 33.89, Humidity: 39.38, "Wind Speed": 29.68, SafeToFly: 1},
            {Temperature: 20.72, Humidity: 67.71, "Wind Speed": 33.49, SafeToFly: 1},
            {Temperature: 16.92, Humidity: 36.25, "Wind Speed": 26.77, SafeToFly: 1},
            {Temperature: 22.24, Humidity: 46.34, "Wind Speed": 23.4, SafeToFly: 0},
            {Temperature: 19.03, Humidity: 24.71, "Wind Speed": 17.55, SafeToFly: 0},
            {Temperature: 38.24, Humidity: 21.52, "Wind Speed": 32.98, SafeToFly: 1},
            {Temperature: 35.2, Humidity: 77.76, "Wind Speed": 30.98, SafeToFly: 1},
            {Temperature: 30.84, Humidity: 70.16, "Wind Speed": 6.36, SafeToFly: 1},
            {Temperature: 36.79, Humidity: 61.76, "Wind Speed": 5.79, SafeToFly: 1},
            {Temperature: 35.09, Humidity: 44.54, "Wind Speed": 16.29, SafeToFly: 1},
            {Temperature: 19.66, Humidity: 30.4, "Wind Speed": 29.32, SafeToFly: 1},
            {Temperature: 37.31, Humidity: 29.39, "Wind Speed": 34.62, SafeToFly: 1},
            {Temperature: 28.48, Humidity: 35.01, "Wind Speed": 9.51, SafeToFly: 0},
            {Temperature: 35.19, Humidity: 52.95, "Wind Speed": 22.82, SafeToFly: 1},
            {Temperature: 37.4, Humidity: 62.88, "Wind Speed": 16.43, SafeToFly: 1},
            {Temperature: 22.95, Humidity: 59.61, "Wind Speed": 34.1, SafeToFly: 1},
            {Temperature: 17.75, Humidity: 36.8, "Wind Speed": 30.26, SafeToFly: 1},
            {Temperature: 20.7, Humidity: 77.29, "Wind Speed": 30.15, SafeToFly: 1},
            {Temperature: 25.68, Humidity: 64.27, "Wind Speed": 19.06, SafeToFly: 0},
            {Temperature: 35.45, Humidity: 53.26, "Wind Speed": 17.44, SafeToFly: 1},
            {Temperature: 36.52, Humidity: 56.7, "Wind Speed": 13.2, SafeToFly: 1},
            {Temperature: 15.17, Humidity: 45.18, "Wind Speed": 6.69, SafeToFly: 0},
            {Temperature: 27.77, Humidity: 34.86, "Wind Speed": 30.94, SafeToFly: 1},
            {Temperature: 25.44, Humidity: 41.36, "Wind Speed": 29.39, SafeToFly: 1},
            {Temperature: 20.55, Humidity: 65.47, "Wind Speed": 34.99, SafeToFly: 1},
            {Temperature: 18, Humidity: 20.86, "Wind Speed": 34.9, SafeToFly: 1},
            {Temperature: 23.44, Humidity: 26.96, "Wind Speed": 21.66, SafeToFly: 0},
            {Temperature: 38.57, Humidity: 22.76, "Wind Speed": 28.07, SafeToFly: 1},
            {Temperature: 23.08, Humidity: 22.44, "Wind Speed": 33.34, SafeToFly: 1},
            {Temperature: 27.97, Humidity: 71.33, "Wind Speed": 30.49, SafeToFly: 1},
            {Temperature: 32.58, Humidity: 62.22, "Wind Speed": 12.42, SafeToFly: 1},
            {Temperature: 24.09, Humidity: 48.45, "Wind Speed": 18.52, SafeToFly: 0},
            {Temperature: 39.29, Humidity: 25.87, "Wind Speed": 8.87, SafeToFly: 1},
            {Temperature: 39.06, Humidity: 49.5, "Wind Speed": 33.62, SafeToFly: 1},
            {Temperature: 21.29, Humidity: 48.41, "Wind Speed": 23.19, SafeToFly: 0},
            {Temperature: 27.43, Humidity: 30.39, "Wind Speed": 11.86, SafeToFly: 0},
            {Temperature: 22.52, Humidity: 46.03, "Wind Speed": 25.15, SafeToFly: 1},
            {Temperature: 22.12, Humidity: 43.91, "Wind Speed": 23.54, SafeToFly: 0},
            {Temperature: 15.92, Humidity: 56.95, "Wind Speed": 15.74, SafeToFly: 0},
            {Temperature: 30.24, Humidity: 58.11, "Wind Speed": 8.41, SafeToFly: 1},
            {Temperature: 27.57, Humidity: 22.72, "Wind Speed": 25.15, SafeToFly: 1},
            {Temperature: 16.29, Humidity: 42.48, "Wind Speed": 20.61, SafeToFly: 0},
            {Temperature: 21.97, Humidity: 57.55, "Wind Speed": 28.17, SafeToFly: 1},
            {Temperature: 37.71, Humidity: 50.19, "Wind Speed": 20.6, SafeToFly: 1},
            {Temperature: 20.99, Humidity: 71.39, "Wind Speed": 30.57, SafeToFly: 1},
            {Temperature: 18.62, Humidity: 59.52, "Wind Speed": 21.56, SafeToFly: 0},
            {Temperature: 27.24, Humidity: 29.78, "Wind Speed": 21.83, SafeToFly: 0},
            {Temperature: 39.64, Humidity: 24.23, "Wind Speed": 31.3, SafeToFly: 1},
            {Temperature: 21.05, Humidity: 58.55, "Wind Speed": 17.1, SafeToFly: 0},
            {Temperature: 31.8, Humidity: 21.59, "Wind Speed": 9.02, SafeToFly: 1},
            {Temperature: 34.04, Humidity: 55.15, "Wind Speed": 5.86, SafeToFly: 1},
            {Temperature: 20.94, Humidity: 76.41, "Wind Speed": 27.65, SafeToFly: 1},
            {Temperature: 33.21, Humidity: 54.53, "Wind Speed": 23.61, SafeToFly: 1},
            {Temperature: 24.19, Humidity: 43.29, "Wind Speed": 26.12, SafeToFly: 1},
            {Temperature: 30.81, Humidity: 58.6, "Wind Speed": 11.39, SafeToFly: 1},
            {Temperature: 30.84, Humidity: 47.5, "Wind Speed": 9.09, SafeToFly: 1},
            {Temperature: 28.39, Humidity: 52.74, "Wind Speed": 5.44, SafeToFly: 0},
            {Temperature: 17.26, Humidity: 76.49, "Wind Speed": 15.52, SafeToFly: 0},
            {Temperature: 35.88, Humidity: 43.17, "Wind Speed": 22.7, SafeToFly: 1},
            {Temperature: 23.02, Humidity: 77.67, "Wind Speed": 16.77, SafeToFly: 0},
            {Temperature: 19.66, Humidity: 74.32, "Wind Speed": 18.12, SafeToFly: 0},
            {Temperature: 16.02, Humidity: 31.75, "Wind Speed": 32.12, SafeToFly: 1},
            {Temperature: 29.77, Humidity: 24.16, "Wind Speed": 15.45, SafeToFly: 0},
            {Temperature: 31.94, Humidity: 26.05, "Wind Speed": 20.42, SafeToFly: 1},
            {Temperature: 15.41, Humidity: 21.09, "Wind Speed": 28.51, SafeToFly: 1},
            {Temperature: 27.8, Humidity: 25.67, "Wind Speed": 16.9, SafeToFly: 0},
            {Temperature: 20.66, Humidity: 60.98, "Wind Speed": 23.66, SafeToFly: 0},
            {Temperature: 31.13, Humidity: 24.27, "Wind Speed": 30.87, SafeToFly: 1},
            {Temperature: 19.36, Humidity: 39.14, "Wind Speed": 33.49, SafeToFly: 1},
            {Temperature: 32.27, Humidity: 70.69, "Wind Speed": 9.41, SafeToFly: 1},
            {Temperature: 24.67, Humidity: 21.4, "Wind Speed": 32.8, SafeToFly: 1},
            {Temperature: 38.42, Humidity: 68.87, "Wind Speed": 19.76, SafeToFly: 1},
            {Temperature: 18.44, Humidity: 36.91, "Wind Speed": 12.75, SafeToFly: 0},
            {Temperature: 23.53, Humidity: 27.09, "Wind Speed": 18.77, SafeToFly: 0},
            {Temperature: 17.84, Humidity: 61.8, "Wind Speed": 34.4, SafeToFly: 1},
            {Temperature: 38.12, Humidity: 57.74, "Wind Speed": 19.78, SafeToFly: 1},
            {Temperature: 36.93, Humidity: 72.65, "Wind Speed": 14.86, SafeToFly: 1},
            {Temperature: 21.45, Humidity: 64.1, "Wind Speed": 24, SafeToFly: 0},
            {Temperature: 31.5, Humidity: 68.21, "Wind Speed": 12.2, SafeToFly: 1},
            {Temperature: 35.43, Humidity: 36.92, "Wind Speed": 7.28, SafeToFly: 1},
            {Temperature: 28.88, Humidity: 30.65, "Wind Speed": 8.87, SafeToFly: 0},
            {Temperature: 28.24, Humidity: 65.04, "Wind Speed": 8.84, SafeToFly: 0},
            {Temperature: 21.05, Humidity: 68.41, "Wind Speed": 9.56, SafeToFly: 0},
            {Temperature: 17.33, Humidity: 79.43, "Wind Speed": 9.16, SafeToFly: 0},
            {Temperature: 37.43, Humidity: 44.76, "Wind Speed": 24.23, SafeToFly: 1},
            {Temperature: 37.51, Humidity: 42.32, "Wind Speed": 10.46, SafeToFly: 1},
            {Temperature: 30.83, Humidity: 66.58, "Wind Speed": 15.37, SafeToFly: 1},
            {Temperature: 23.48, Humidity: 40.45, "Wind Speed": 31.9, SafeToFly: 1},
            {Temperature: 23.73, Humidity: 75.85, "Wind Speed": 19.22, SafeToFly: 0},
            {Temperature: 33.15, Humidity: 71.5, "Wind Speed": 25.03, SafeToFly: 1},
            {Temperature: 37.43, Humidity: 45.74, "Wind Speed": 10.17, SafeToFly: 1},
            {Temperature: 37.18, Humidity: 65.05, "Wind Speed": 10.77, SafeToFly: 1},
            {Temperature: 34.5, Humidity: 65.27, "Wind Speed": 6.23, SafeToFly: 1}
        ];
    }
}

let dronePlanner;
document.addEventListener('DOMContentLoaded', () => {
    dronePlanner = new DronePlanner();
}); 