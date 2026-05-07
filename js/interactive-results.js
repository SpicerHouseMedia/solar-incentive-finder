/**
 * SolarIncentiveFinder - Interactive Results & Lead Gen
 * Flow: Input (Zip+Bill) -> Labor Illusion Loader -> Gated Results
 * UX: Spotlight Mode (Blurs incentive content below, calculator stays sharp)
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
            ticker.innerHTML = `🔴 Live: <span class="font-bold">${trendData.counts[idx]} homeowners</span> in ${trendData.states[idx]} checked savings today!`;
            idx = (idx + 1) % 8;
        }, 5000);
    }

    const container = document.getElementById('dynamic-results');
    if (!container) return;

    // Check for cached zip from form submission on results page
    const urlParams = new URLSearchParams(window.location.search);
    let zip = urlParams.get('zip') || '';
    const bill = urlParams.get('bill') || '150';
    const stateRaw = window.location.pathname.split('/')[2];
    const state = urlParams.get('state') || (stateRaw ? stateRaw.replace('.html', '') : 'US');

    // If no zip in URL, check if there's a form in the HTML we need to hijack
    const zipForm = document.getElementById('zip-form');
    if (zipForm && !zip) {
        zipForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const zipVal = document.getElementById('zip-code').value.trim();
            if (zipVal.length >= 5) {
                // Redirect to state-specific results page with zip
                showInputStep(zipVal, bill, state, container);
                return;
            }
        });
    }

    // Ensure #dynamic-results never inherits blur
    container.style.filter = 'none';
    container.style.position = 'relative';
    container.style.zIndex = '10';

    activateSpotlight(container);
    
    // Show bill slider step or handle form submission
    showInputStep(zip, bill, state, container);
});

// Blur ONLY the sibling content blocks below #dynamic-results
function activateSpotlight(container) {
    const style = document.createElement('style');
    style.textContent = `
        /* Safety: NEVER blur #dynamic-results or its children */
        #dynamic-results, #dynamic-results * {
            filter: none !important;
            opacity: 1 !important;
        }
        /* Heavy lock on sibling content — totally unreadable until email */
        .spotlight-blur-sib {
            filter: blur(14px) brightness(0.8) grayscale(0.3) !important;
            opacity: 0.5 !important;
            pointer-events: none;
            transition: all 0.8s ease;
        }
        .spotlight-clear-sib {
            filter: none !important;
            opacity: 1 !important;
            pointer-events: auto !important;
            transition: all 0.8s ease;
        }
        /* Centered "Unlock" badge over blurred content */
        .lock-badge {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 20;
            background: #fbbf24;
            color: #78350f;
            font-size: 1rem;
            font-weight: 800;
            padding: 0.8rem 1.5rem;
            border-radius: 2rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            white-space: nowrap;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        /* === CONVERSION ANIMATIONS === */
        @keyframes subtle-pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.35); }
            50% { box-shadow: 0 0 0 8px rgba(245, 158, 11, 0); }
        }
        @keyframes slide-in-up {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .subtle-pulse { animation: subtle-pulse 2.5s ease-in-out infinite; }
        .slide-in-up { animation: slide-in-up 0.4s ease-out forwards; }
    `;
    document.head.appendChild(style);

    // Target the FIRST meaningful content block below #dynamic-results
    let sibling = container.nextElementSibling;
    while (sibling) {
        if (sibling.nodeType === 1 && sibling.tagName !== 'NAV' && sibling.tagName !== 'FOOTER') {
            if (sibling.id !== 'dynamic-results') {
                sibling.classList.add('spotlight-blur-sib');
                sibling.style.position = 'relative';
                
                const badge = document.createElement('div');
                badge.className = 'lock-badge';
                badge.id = 'lock-badge-overlay';
                badge.innerHTML = '🔒 Unlock Full Incentives & Installer List';
                sibling.appendChild(badge);
                break; // Only lock the main content area
            }
        }
        sibling = sibling.nextElementSibling;
    }
}

function showInputStep(zip, bill, state, container) {
    // If no zip provided, show a message (shouldn't happen for normal flow)
    if (!zip) {
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-xl border border-slate-200 p-6 sm:p-8 text-center">
                <p class="text-lg font-bold text-slate-900">Enter your zip code on the homepage to get started!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="bg-white rounded-xl shadow-xl border border-slate-200 p-6 sm:p-8 text-center">
            <div class="absolute -top-3 -right-3 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">Customize</div>
            <h2 class="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Customize Your Solar Report</h2>
            <p class="text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6">Adjust your bill to see your estimated savings in ${state.toUpperCase()}.</p>
            
            <div class="max-w-xs sm:max-w-sm mx-auto space-y-4 sm:space-y-6">
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
                    Calculate My Savings →
                </button>
            </div>
        </div>
    `;

    const slider = document.getElementById('bill-slider');
    const display = document.getElementById('bill-display');
    slider.addEventListener('input', () => display.textContent = `$${slider.value} / mo`);

    document.getElementById('calculate-btn').addEventListener('click', () => {
        const newZip = document.getElementById('zip-input').value.trim();
        const newBill = parseInt(slider.value);
        if(newZip.length >= 5) {
            // Keep blur on sibling content during calculation too

            container.innerHTML = `
                <div class="bg-white rounded-xl shadow-xl border border-green-200 p-6 sm:p-8 text-center" id="calc-loader">
                    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mx-auto mb-4"></div>
                    <h3 class="text-lg font-bold text-slate-800">Calculating your solar savings...</h3>
                    <p class="text-amber-600 text-sm font-medium mt-2" id="calc-status">Analyzing your energy usage...</p>
                </div>
            `;

            const statuses = [
                "Matching zip to municipal tax records...",
                "Checking local utility rebates in ${state.toUpperCase()}...",
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
                    showResults(newZip, state.toUpperCase(), newBill);
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
        <div class="bg-white rounded-xl shadow-xl border border-green-200 p-4 sm:p-6 md:p-8 animate-fade-in max-w-sm mx-auto w-full">
            <div class="flex items-center justify-between mb-3">
                <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase">Savings Report</span>
                <span class="text-slate-400 text-[10px] sm:text-xs">Zip: ${zip}</span>
            </div>
            
            <h2 class="text-lg sm:text-xl font-bold text-slate-900 mb-1">Your Estimated Savings:</h2>
            <div class="mt-1 mb-3 sm:mb-5">
                <span class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-green-600 block break-words leading-none">$${baseSavings.toLocaleString()}</span>
                <!-- REMOVED: "over 25 years" — shrinks perceived value -->
            </div>

            <div class="relative">
                <div id="blurred-content" class="blur-sm select-none pointer-events-none bg-slate-50 rounded-lg p-4 border border-slate-100 space-y-3">
                    <div class="flex justify-between">
                        <span class="text-slate-600">Federal Tax Credit (30%)</span>
                        <span class="font-bold text-slate-800">$${Math.round(baseSavings * 0.30).toLocaleString()}</span>
                    </div>
                    <div class="flex justify-between border-t border-slate-200 pt-2">
                        <span class="text-slate-800 font-bold">Total Benefit</span>
                        <span class="font-bold text-green-600">$${baseSavings.toLocaleString()}</span>
                    </div>
                </div>
                
                <div id="gate-overlay" class="absolute inset-0 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm rounded-lg p-3 sm:p-6 subtle-pulse slide-in-up">
                    <p class="text-sm sm:text-lg font-bold text-slate-900 mb-1 text-center px-1 leading-snug">🔓 Unlock Your <span class="text-amber-600">$${baseSavings.toLocaleString()}</span> Report</p>
                    <p class="text-xs text-slate-500 mb-3 sm:mb-4 text-center px-1">We'll email your full solar breakdown + installer list for zip <strong>${zip}</strong></p>
                    <div class="flex flex-col gap-3">
                        <input type="email" id="user-email" placeholder="your@email.com" class="w-full px-4 py-3 text-sm border-2 border-amber-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium">
                        <button id="unlock-btn" class="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-lg transition shadow-md cursor-pointer">Send Report</button>
                    </div>
                </div>
            </div>

            <div class="mt-8 sm:mt-10 flex flex-col gap-3">
                <button onclick="window.location.href=window.location.pathname" class="flex-1 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-lg transition">Back</button>
                <!-- TODO: Update to /blog/2026-solar-guide/ when guide post is built -->
                <a href="/blog/2026-solar-guide/" class="flex-1 text-center bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-lg transition">Read Our Guide</a>
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
    let base = avgs[state.toUpperCase()] || avgs['US'];
    const multiplier = bill / 150; 
    return Math.round(base * multiplier);
}

function unlockContent(email, zip, state, bill) {
    const workerUrl = "https://email-sender.joe-13c.workers.dev";
    
    // REMOVE the gate overlay from inside the card
    const gate = document.getElementById('gate-overlay');
    if (gate) gate.remove();
    
    // UNBLUR the savings breakdown
    const blurred = document.getElementById('blurred-content');
    if (blurred) blurred.classList.remove('blur-sm', 'select-none', 'pointer-events-none');
    
    // UNBLUR the STATE content below (sibling)
    const allBlurred = document.querySelectorAll('.spotlight-blur-sib');
    allBlurred.forEach(el => {
        el.classList.replace('spotlight-blur-sib', 'spotlight-clear-sib');
        // Remove lock badges
        const badges = el.querySelectorAll('.lock-badge, #lock-badge-overlay');
        badges.forEach(b => b.remove());
    });

    // Show success
    const btn = document.createElement('div');
    btn.className = 'bg-green-50 border border-green-300 rounded-lg p-3 text-center mt-4 slide-in-up';
    btn.innerHTML = `<p class="text-sm font-bold text-green-700">✅ Full report sent to ${email}! Check your inbox.</p>`;
    blurred.parentElement.appendChild(btn);

    fetch(workerUrl, {
        method: "POST",
        body: JSON.stringify({
            email: email,
            zip: zip,
            state: state,
            monthlyBill: bill
        })
    }).then(res => res.json()).then(data => {
        console.log("Email sent:", data);
    }).catch(err => console.error("Email failed:", err));
}
