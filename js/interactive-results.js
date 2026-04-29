/**
 * SolarIncentiveFinder - Interactive Results & Lead Gen
 * Features:
 * 1. Labor Illusion Loader (Builds trust)
 * 2. Dynamic Savings Calculator based on Zip/State
 * 3. Gated Results (Email Capture)
 * 4. Trend Ticker (Social Proof)
 */

// Global Trend Data for Social Proof
const trendData = {
    states: ['Texas', 'Florida', 'California', 'Arizona', 'Ohio', 'Pennsylvania', 'Georgia', 'New York'],
    counts: ['140', '89', '201', '156', '42', '78', '93', '112'],
    amounts: ['$18,500', '$15,200', '$22,100', '$19,000', '$12,400', '$16,800', '$14,900', '$24,500']
};

document.addEventListener('DOMContentLoaded', () => {
    // Homepage Ticker Update
    const ticker = document.getElementById('live-ticker');
    if (ticker) {
        let idx = 0;
        setInterval(() => {
            ticker.innerHTML = `🔴 Live: <span class="font-bold">${trendData.counts[idx]} homeowners</span> in ${trendData.states[idx]} checked solar savings today!`;
            idx = (idx + 1) % 8;
        }, 5000);
    }

    // Interactive Results for State Pages
    const container = document.getElementById('dynamic-results');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const zip = urlParams.get('zip') || '';
    const state = urlParams.get('state') || window.location.pathname.split('/')[2]?.replace('.html', '') || 'US';

    runInteractiveResults(zip, state);
});

function runInteractiveResults(zip, state) {
    const container = document.getElementById('dynamic-results');
    if (!zip) {
        container.innerHTML = '<div class="text-center py-12 bg-white rounded-xl border border-slate-200"><h3 class="text-xl font-bold text-slate-800">Enter your zip to see your savings</h3></div>';
        return;
    }
    
    // 1. Initial Loader (Labor Illusion)
    container.innerHTML = `
        <div class="bg-white rounded-xl shadow-lg border border-green-200 p-6 sm:p-8 text-center" id="calc-loader">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <h3 class="text-lg font-bold text-slate-800">Calculating your solar savings...</h3>
            <p class="text-amber-600 text-sm font-medium mt-2" id="calc-status">Locating your zip code...</p>
        </div>
    `;

    // 2. Sequence of "Calculations"
    const statuses = [
        "Matching zip code to municipal tax records...",
        "Analyzing average sunlight hours for your roof...",
        "Checking local utility rebates in your area...",
        "Calculating 30% Federal Tax Credit...",
        "Generating your savings report..."
    ];

    let step = 0;
    const interval = setInterval(() => {
        document.getElementById('calc-status').textContent = statuses[step];
        step++;
        if (step >= statuses.length) {
            clearInterval(interval);
            showResults(zip, state);
            addTrendTicker();
        }
    }, 800); // 800ms per step for ~4 seconds total
}

function showResults(zip, state) {
    const container = document.getElementById('dynamic-results');
    const baseSavings = getBaseSavings(state);
    
    container.innerHTML = `
        <div class="bg-white rounded-xl shadow-lg border border-green-200 p-6 sm:p-8 animate-fade-in">
            <div class="flex items-center justify-between mb-4">
                <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Savings Report</span>
                <span class="text-slate-400 text-xs">Zip: ${zip}</span>
            </div>
            
            <h2 class="text-2xl font-bold text-slate-900 mb-2">Your Estimated Savings:</h2>
            <div class="mt-2 mb-6">
                <span class="text-4xl sm:text-5xl font-extrabold text-green-600">$${baseSavings.toLocaleString()}</span>
                <span class="text-slate-500 ml-2">over 25 years</span>
            </div>

            <!-- The Gated Section -->
            <div class="relative">
                <div id="blurred-content" class="blur-sm select-none pointer-events-none bg-slate-50 rounded-lg p-4 border border-slate-100 space-y-3">
                    <div class="flex justify-between">
                        <span class="text-slate-600">Federal Tax Credit (30%)</span>
                        <span class="font-bold text-slate-800">$${Math.round(baseSavings * 0.30).toLocaleString()}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-600">State Tax & Rebates</span>
                        <span class="font-bold text-slate-800">$${Math.round(baseSavings * 0.15).toLocaleString()}</span>
                    </div>
                    <div class="flex justify-between border-t border-slate-200 pt-2">
                        <span class="text-slate-800 font-bold">Total Benefit</span>
                        <span class="font-bold text-green-600">$${baseSavings.toLocaleString()}</span>
                    </div>
                </div>
                
                <!-- The Gate -->
                <div id="gate-overlay" class="absolute inset-0 flex flex-col items-center justify-center bg-black/10 backdrop-blur-sm rounded-lg">
                    <p class="text-sm font-bold text-slate-800 mb-2">🔒 Unlock Full Breakdown</p>
                    <p class="text-xs text-slate-500 mb-2">We'll send you the detailed savings report + local installer list.</p>
                    <div class="flex w-full max-w-xs gap-2">
                        <input type="email" id="user-email" placeholder="email@address.com" class="flex-1 px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500">
                        <button id="unlock-btn" class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded transition">Unlock</button>
                    </div>
                </div>
            </div>

            <div class="mt-6 flex gap-3">
                <a href="/" class="flex-1 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-lg transition">Check Another Zip</a>
                <a href="/blog/" class="flex-1 text-center bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-lg transition">Read Our Guide</a>
            </div>
        </div>
    `;

    // Add Event Listener for Unlock
    document.getElementById('unlock-btn').addEventListener('click', () => {
        const email = document.getElementById('user-email').value;
        if (email && email.includes('@')) {
            unlockContent(email, zip, state);
        } else {
            document.getElementById('user-email').classList.add('border-red-500', 'ring-1', 'ring-red-500');
        }
    });
}

function unlockContent(email, zip, state) {
    const scriptUrl = "https://script.google.com/macros/s/AKfycbxp5CDO40dghD5ubQnU1XMLO0uoH0mK7i52nl_yu-6RDziolwRfRZHHTOIYiv1e-DZ3TA/exec";
    
    document.getElementById('gate-overlay').classList.add('hidden');
    document.getElementById('blurred-content').classList.remove('blur-sm', 'select-none', 'pointer-events-none');
    document.getElementById('user-email').value = '✅ Report Sent!';
    document.getElementById('user-email').disabled = true;
    document.getElementById('unlock-btn').textContent = 'Done';
    document.getElementById('unlock-btn').disabled = true;

    // Send lead data to Google Sheets
    fetch(scriptUrl, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({
            email: email,
            zip: zip,
            state: state,
            bill: "" // Placeholder for future bill slider
        })
    }).then(() => console.log("Lead captured successfully"))
      .catch(err => console.error("Lead capture failed:", err));
}

function getBaseSavings(state) {
    const avgs = { 'CA': 24000, 'TX': 21000, 'FL': 19500, 'AZ': 22000, 'NY': 20000, 'CO': 18000, 'MA': 23000, 'NJ': 21500, 'US': 18500 };
    const base = avgs[state] || avgs['US'];
    const variance = base * 0.10;
    return Math.round(base + ((Math.random() * variance * 2) - variance));
}

function addTrendTicker() {
    const parent = document.getElementById('dynamic-results').parentElement;
    
    const ticker = document.createElement('div');
    ticker.id = 'trend-ticker';
    ticker.className = 'mt-6 bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-center gap-3 text-sm text-blue-800';
    ticker.innerHTML = `
        <span class="animate-pulse">🔴 Live:</span>
        <span id="ticker-text">A homeowner in <b>Texas</b> just saved <b>$18,500</b> on solar!</span>
    `;
    parent.appendChild(ticker);

    let i = 0;
    setInterval(() => {
        document.getElementById('ticker-text').innerHTML = `A homeowner in <b>${trendData.states[i]}</b> just saved <b>${trendData.amounts[i]}</b> on solar!`;
        i = (i + 1) % trendData.states.length;
    }, 5000);
}
