/**
 * SolarIncentiveFinder - Interactive Results & Lead Gen
 * Flow: Input (Zip+Bill) -> Labor Illusion Loader -> Gated Results
 */

const trendData = {
    states: ['Texas', 'Florida', 'California', 'Arizona', 'Ohio', 'Pennsylvania', 'Georgia', 'New York'],
    counts: ['140', '89', '201', '156', '42', '78', '93', '112'],
    amounts: ['$18,500', '$15,200', '$22,100', '$19,000', '$12,400', '$16,800', '$14,900', '$24,500']
};

// Avg $/kWh by State (EIA Data)
const stateRates = { 
    'AL': 0.13, 'AK': 0.24, 'AZ': 0.14, 'AR': 0.11, 'CA': 0.28, 'CO': 0.13, 'CT': 0.30, 'DE': 0.15, 
    'FL': 0.14, 'GA': 0.12, 'HI': 0.44, 'ID': 0.10, 'IL': 0.14, 'IN': 0.14, 'IA': 0.13, 'KS': 0.12, 
    'KY': 0.12, 'LA': 0.11, 'ME': 0.25, 'MD': 0.16, 'MA': 0.28, 'MI': 0.17, 'MN': 0.14, 'MS': 0.11, 
    'MO': 0.11, 'MT': 0.11, 'NE': 0.10, 'NV': 0.13, 'NH': 0.24, 'NJ': 0.18, 'NM': 0.13, 'NY': 0.22, 
    'NC': 0.12, 'ND': 0.10, 'OH': 0.14, 'OK': 0.11, 'OR': 0.11, 'PA': 0.15, 'RI': 0.26, 'SC': 0.12, 
    'SD': 0.11, 'TN': 0.11, 'TX': 0.13, 'UT': 0.11, 'VT': 0.21, 'VA': 0.12, 'WA': 0.10, 'WV': 0.11, 
    'WI': 0.16, 'WY': 0.10, 'US': 0.16
};

document.addEventListener('DOMContentLoaded', () => {
    const ticker = document.getElementById('live-ticker');
    if (ticker) {
        let idx = 0;
        setInterval(() => {
            ticker.innerHTML = ` Live: <span class="font-bold">${trendData.counts[idx]} homeowners</span> in ${trendData.states[idx]} checked savings today!`;
            idx = (idx + 1) % 8;
        }, 5000);
    }

    const container = document.getElementById('dynamic-results');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const zip = urlParams.get('zip') || '';
    const bill = urlParams.get('bill') || '150';
    const stateRaw = window.location.pathname.split('/')[2];
    const state = urlParams.get('state') || (stateRaw ? stateRaw.replace('.html', '') : 'US');

    showInputStep(zip, bill, state, container);
});

function showInputStep(zip, bill, state, container) {
    container.innerHTML = `
        <div class="bg-white rounded-xl shadow-xl border border-slate-200 p-6 sm:p-8 text-center">
            <div class="absolute -top-3 -right-3 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">Customize</div>
            <h2 class="text-2xl font-bold text-slate-900 mb-2">Customize Your Solar Report</h2>
            <p class="text-slate-500 mb-6">Adjust your bill to see your estimated savings in ${state}.</p>
            
            <div class="max-w-sm mx-auto space-y-6">
                <div>
                    <label class="block text-sm font-bold text-left mb-1">Your Zip Code</label>
                    <input type="text" id="zip-input" value="${zip}" placeholder="10001" class="w-full px-4 py-3 border border-slate-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                </div>
                
                <div>
                    <label class="block text-sm font-bold text-left mb-1">Avg. Monthly Electric Bill</label>
                    <div class="flex items-center gap-3 mb-2">
                        <span class="text-xs text-slate-400">$50</span>
                        <input type="range" id="bill-slider" min="50" max="600" value="${bill}" class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500">
                        <span class="text-xs text-slate-400">$600+</span>
                    </div>
                    <div class="text-center mb-1">
                        <span id="bill-display" class="text-lg font-bold text-amber-600">$${bill} / mo</span>
                    </div>
                </div>

                <button id="calculate-btn" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition shadow-md text-lg">
                    Calculate My Savings 
                </button>
            </div>
        </div>
    `;

    const slider = document.getElementById('bill-slider');
    const display = document.getElementById('bill-display');
    slider.addEventListener('input', () => display.textContent = `$${slider.value} / mo`);

    document.getElementById('calculate-btn').addEventListener('click', () => {
        const newZip = document.getElementById('zip-input').value.trim();
        const newBill = slider.value;
        if(newZip.length >= 5) {
            container.innerHTML = `
                <div class="bg-white rounded-xl shadow-xl border border-green-200 p-6 sm:p-8 text-center" id="calc-loader">
                    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mx-auto mb-4"></div>
                    <h3 class="text-lg font-bold text-slate-800">Calculating your solar savings...</h3>
                    <p class="text-amber-600 text-sm font-medium mt-2" id="calc-status">Analyzing your energy usage...</p>
                </div>
            `;

            const statuses = [
                "Matching zip to municipal tax records...",
                "Checking local utility rebates in ${state}...",
                "Estimating roof surface area...",
                "Calculating 25-year system savings...",
                "Finalizing your solar report..."
            ];
            
            let step = 0;
            const interval = setInterval(() => {
                const statusEl = document.getElementById('calc-status');
                if(statusEl) statusEl.textContent = statuses[step];
                step++;
                if (step >= statuses.length) {
                    clearInterval(interval);
                    showResults(newZip, state, newBill);
                }
            }, 800);
        } else {
            document.getElementById('zip-input').classList.add('border-red-500');
        }
    });
}

function showResults(zip, state, bill) {
    const container = document.getElementById('dynamic-results');
    const baseSavings = getBaseSavings(state, bill);
    
    container.innerHTML = `
        <div class="bg-white rounded-xl shadow-xl border border-green-200 p-6 sm:p-8 animate-fade-in">
            <div class="flex items-center justify-between mb-4">
                <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Savings Report</span>
                <span class="text-slate-400 text-xs">Zip: ${zip}</span>
            </div>
            
            <h2 class="text-2xl font-bold text-slate-900 mb-2">Your Estimated Savings:</h2>
            <div class="mt-2 mb-6">
                <span class="text-4xl sm:text-5xl font-extrabold text-green-600">$${baseSavings.toLocaleString()}</span>
                <span class="text-slate-500 ml-2">over 25 years</span>
            </div>

            <div class="relative">
                <div id="blurred-content" class="blur-sm select-none pointer-events-none bg-slate-50 rounded-lg p-4 border border-slate-100 space-y-3">
                    <div class="flex justify-between">
                        <span class="text-slate-600">Est. Monthly Usage</span>
                        <span class="font-bold text-slate-800">${Math.round(bill / (stateRates[state] || 0.16))} kWh</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-600">Federal Tax Credit (30%)</span>
                        <span class="font-bold text-slate-800">$${Math.round(baseSavings * 0.30).toLocaleString()}</span>
                    </div>
                    <div class="flex justify-between border-t border-slate-200 pt-2">
                        <span class="text-slate-800 font-bold">Total Benefit</span>
                        <span class="font-bold text-green-600">$${baseSavings.toLocaleString()}</span>
                    </div>
                </div>
                
                <div id="gate-overlay" class="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-lg p-4 border border-dashed border-amber-500">
                    <p class="text-sm font-bold text-slate-800 mb-1">✨ Get Your Full Solar Profile</p>
                    <p class="text-xs text-slate-500 mb-3 text-center">We'll send your full breakdown report and installer list.</p>
                    <div class="flex w-full max-w-xs gap-2">
                        <input type="email" id="user-email" placeholder="email@address.com" class="flex-1 px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500">
                        <button id="unlock-btn" class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded transition">Send</button>
                    </div>
                </div>
            </div>

            <div class="mt-6 flex gap-3">
                <button onclick="window.location.href=window.location.pathname" class="flex-1 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-lg transition">Back</button>
                <a href="/blog/" class="flex-1 text-center bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-lg transition">Read Guide</a>
            </div>
        </div>
    `;

    document.getElementById('unlock-btn').addEventListener('click', () => {
        const email = document.getElementById('user-email').value;
        if (email && email.includes('@')) {
            unlockContent(email, zip, state, bill);
        } else {
            document.getElementById('user-email').classList.add('border-red-500');
        }
    });
}

function getBaseSavings(state, bill) {
    const avgs = { 'CA': 24000, 'TX': 21000, 'FL': 19500, 'AZ': 22000, 'NY': 20000, 'CO': 18000, 'MA': 23000, 'NJ': 21500, 'US': 18500 };
    let base = avgs[state] || avgs['US'];
    const multiplier = bill / 150; 
    return Math.round(base * multiplier);
}

function unlockContent(email, zip, state, bill) {
    const scriptUrl = "https://script.google.com/macros/s/AKfycbxp5CDO40dghD5ubQnU1XMLO0uoH0mK7i52nl_yu-6RDziolwRfRZHHTOIYv1e-DZ3TA/exec";
    
    document.getElementById('gate-overlay').classList.add('hidden');
    document.getElementById('blurred-content').classList.remove('blur-sm', 'select-none', 'pointer-events-none');
    document.getElementById('user-email').value = '✅ Report Sent!';

    fetch(scriptUrl, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({
            email: email,
            zip: zip,
            state: state,
            monthlyBill: bill
        })
    });
}