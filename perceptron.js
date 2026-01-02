
class Perceptron {
    constructor(n, lr = 0.1) {
        this.weights = new Array(n + 1).fill(0);
        this.lr = lr;
    }

    
    predict(inputs) {
        let sum = this.weights[0]; //threshold
        for (let i = 0; i < inputs.length; i++) {
            sum += inputs[i] * this.weights[i + 1]; //the equation
        }
        return sum >= 0 ? 1 : 0;
    }

    train(X, y, epochs = 100) {
        for (let e = 0; e < epochs; e++) {
            for (let i = 0; i < X.length; i++) {
                const pred = this.predict(X[i]);
                const err = y[i] - pred; 
                
                
                this.weights[0] += this.lr * err; //thresold 
                
                for (let j = 0; j < X[i].length; j++) {
                    this.weights[j + 1] += this.lr * err * X[i][j];
                }
            }
        }
    }

    getWeights() {
        return [...this.weights];
    }

    
    setWeights(weights) {
        this.weights = [...weights];
    }

    
    getLearningRate() {
        return this.lr;
    }


    setLearningRate(lr) {
        this.lr = lr;
    }
}
