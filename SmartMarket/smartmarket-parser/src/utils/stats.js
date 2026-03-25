const chalk = require('chalk');

class ParsingStats {

    constructor() {
        this.startTime = Date.now();

        this.counters = {
            filesProcessed: 0,
            filesSkipped: 0,
            productsInserted: 0,
            promotionsInserted: 0,
            storesInserted: 0,
            errorsEncountered: 0,
            duplicatesSkipped: 0
        };

        this.chainStats = {};
    }

    increment(metric, count = 1) {
        if (this.counters.hasOwnProperty(metric)) {
            this.counters[metric] += count;
        }
    }

    trackChain(chainName, type, count) {
        if (!this.chainStats[chainName]) {
            this.chainStats[chainName] = {
                products: 0,
                promotions: 0,
                stores: 0
            };
        }

        this.chainStats[chainName][type] += count;
    }

    getDuration() {
        return ((Date.now() - this.startTime) / 1000).toFixed(2);
    }

    getRate(metric) {
        const duration = this.getDuration();
        const count = this.counters[metric];
        return duration > 0 ? (count / duration).toFixed(2) : 0;
    }

    report() {
        const duration = this.getDuration();

        console.log('\n' + chalk.cyan('='.repeat(70)));
        console.log(chalk.bold.cyan('📊 PARSING STATISTICS'));
        console.log(chalk.cyan('='.repeat(70)));

        console.log(chalk.yellow('\n⏱️ Duration:'), `${duration}s`);

        console.log(chalk.yellow('\n📁 Files:'));
        console.log(` Processed: ${chalk.green(this.counters.filesProcessed)}`);
        console.log(` Skipped: ${chalk.gray(this.counters.filesSkipped)}`);

        console.log(chalk.yellow('\n📦 Products:'));
        console.log(` Inserted: ${chalk.green(this.counters.productsInserted)}`);
        console.log(` Rate: ${this.getRate('productsInserted')}/sec`);

        console.log(chalk.yellow('\n🏷️ Promotions:'));
        console.log(` Inserted: ${chalk.green(this.counters.promotionsInserted)}`);

        console.log(chalk.yellow('\n🏪 Stores:'));
        console.log(` Inserted: ${chalk.green(this.counters.storesInserted)}`);

        console.log(chalk.yellow('\n⚠️ Issues:'));
        console.log(` Errors: ${chalk.red(this.counters.errorsEncountered)}`);
        console.log(` Duplicates: ${chalk.gray(this.counters.duplicatesSkipped)}`);

        if (Object.keys(this.chainStats).length > 0) {
            console.log(chalk.yellow('\n🏢 By Chain:'));
            Object.entries(this.chainStats).forEach(([chain, stats]) => {
                console.log(` ${chalk.bold(chain)}:`);
                console.log(`   Products: ${stats.products}`);
                console.log(`   Promotions: ${stats.promotions}`);
                console.log(`   Stores: ${stats.stores}`);
            });
        }

        console.log(chalk.cyan('\n' + '='.repeat(70) + '\n'));
    }
}

module.exports = ParsingStats;