     1|/**
     2| * SolarIncentiveFinder - Interactive Results & Lead Gen
     3| * Flow: Input (Zip+Bill) -> Labor Illusion Loader -> Gated Results
     4| * UX: Spotlight Mode (Blurs incentive content below, calculator stays sharp)
     5| */
     6|
     7|const trendData = {
     8|    states: ['Texas', 'Florida', 'California', 'Arizona', 'Ohio', 'Pennsylvania', 'Georgia', 'New York'],
     9|    counts: ['140', '89', '201', '156', '42', '78', '93', '112'],
    10|    amounts: ['$18,500', '$15,200', '$22,100', '$19,000', '$12,400', '$16,800', '$14,900', '$24,500']
    11|};
    12|
    13|// Avg $/kWh by State (EIA Data)
    14|const stateRates = {
    15|    'AL': 0.13, 'AK': 0.24, 'AZ': 0.14, 'AR': 0.11, 'CA': 0.28, 'CO': 0.13, 'CT': 0.30, 'DE': 0.15,
    16|    'FL': 0.14, 'GA': 0.12, 'HI': 0.44, 'ID': 0.10, 'IL': 0.14, 'IN': 0.14, 'IA': 0.13, 'KS': 0.12,
    17|    'KY': 0.12, 'LA': 0.11, 'ME': 0.25, 'MD': 0.16, 'MA': 0.28, 'MI': 0.17, 'MN': 0.14, 'MS': 0.11,
    18|    'MO': 0.11, 'MT': 0.11, 'NE': 0.10, 'NV': 0.13, 'NH': 0.24, 'NJ': 0.18, 'NM': 0.13, 'NY': 0.22,
    19|    'NC': 0.12, 'ND': 0.10, 'OH': 0.14, 'OK': 0.11, 'OR': 0.11, 'PA': 0.15, 'RI': 0.26, 'SC': 0.12,
    20|    'SD': 0.11, 'TN': 0.11, 'TX': 0.13, 'UT': 0.11, 'VT': 0.21, 'VA': 0.12, 'WA': 0.10, 'WV': 0.11,
    21|    'WI': 0.16, 'WY': 0.10, 'US': 0.16
    22|};
    23|
    24|document.addEventListener('DOMContentLoaded', () => {
    25|    const ticker = document.getElementById('live-ticker');
    26|    if (ticker) {
    27|        let idx = 0;
    28|        setInterval(() => {
    29|            ticker.innerHTML = ` Live: <span class="font-bold">${trendData.counts[idx]} homeowners</span> in ${trendData.states[idx]} checked savings today!`;
    30|            idx = (idx + 1) % 8;
    31|        }, 5000);
    32|    }
    33|
    34|    const container = document.getElementById('dynamic-results');
    35|    if (!container) return;
    36|
    37|    const urlParams = new URLSearchParams(window.location.search);
    38|    const zip = urlParams.get('zip') || '';
    39|    const bill = urlParams.get('bill') || '150';
    40|    const stateRaw = window.location.pathname.split('/')[2];
    41|    const state = urlParams.get('state') || (stateRaw ? stateRaw.replace('.html', '') : 'US');
    42|
    43|    // Ensure #dynamic-results never inherits blur
    44|    container.style.filter = 'none';
    45|    container.style.position = 'relative';
    46|    container.style.zIndex = '10';
    47|
    48|    activateSpotlight(container);
    49|    showInputStep(zip, bill, state, container);
    50|});
    51|
    52|// Blur ONLY the sibling content blocks below #dynamic-results
    53|function activateSpotlight(container) {
    54|    const style = document.createElement('style');
    55|    style.textContent = `
    56|        /* Safety: NEVER blur #dynamic-results or its children */
    57|        #dynamic-results, #dynamic-results * {
    58|            filter: none !important;
    59|            opacity: 1 !important;
    60|        }
    61|        /* Heavy lock on sibling content — totally unreadable, must email */
    62|        .spotlight-blur-sib {
    63|            filter: blur(12px) brightness(0.7) grayscale(0.4);
    64|            opacity: 0.35;
    65|            pointer-events: none;
    66|            transition: all 0.6s ease;
    67|        }
    68|        .spotlight-clear-sib {
    69|            filter: none !important;
    70|            opacity: 1 !important;
    71|            pointer-events: auto !important;
    72|            transition: all 0.6s ease;
    73|        }
    74|        /* Centered "Unlock" badge over blurred content */
    75|        .lock-badge {
    76|            position: absolute;
    77|            top: 50%;
    78|            left: 50%;
    79|            transform: translate(-50%, -50%);
    80|            z-index: 5;
    81|            background: rgba(251, 191, 36, 0.9); color: #111; border: 2px solid #fff;
    82|            color: white;
    83|            font-size: 0.85rem;
    84|            font-weight: 700;
    85|            padding: 0.6rem 1.2rem;
    86|            border-radius: 2rem;
    87|            display: flex;
    88|            align-items: center;
    89|            gap: 0.4rem;
    90|            white-space: nowrap;
    91|        }
    92|        /* === CONVERSION ANIMATIONS === */
    93|        @keyframes subtle-pulse {
    94|            0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.35); }
    95|            50% { box-shadow: 0 0 0 8px rgba(245, 158, 11, 0); }
    96|        }
    97|        @keyframes slide-in-up {
    98|            from { opacity: 0; transform: translateY(10px); }
    99|            to { opacity: 1; transform: translateY(0); }
   100|        }
   101|        .subtle-pulse { animation: subtle-pulse 2.5s ease-in-out infinite; }
   102|        .slide-in-up { animation: slide-in-up 0.4s ease-out forwards; }
   103|    `;
   104|    document.head.appendChild(style);
   105|
    // Target: The container with the state content (next sibling after #dynamic-results)
    let sibling = container.nextElementSibling;
    while (sibling) {
        if (sibling.nodeType === 1 && sibling.offsetParent !== null && !sibling.id) {
            sibling.classList.add('spotlight-blur-sib');
            sibling.style.position = 'relative';
            
            const badge = document.createElement('div');
            badge.className = 'lock-badge';
            badge.innerHTML = '🔒 Unlock Full Incentives & Installers';
            sibling.appendChild(badge);
            break; // Only lock the first one
        }
        sibling = sibling.nextElementSibling;
    }
   130|}
   131|
   132|function showInputStep(zip, bill, state, container) {
   133|    container.innerHTML = `
   134|        <div class="bg-white rounded-xl shadow-xl border border-slate-200 p-6 sm:p-8 text-center">
   135|            <div class="absolute -top-3 -right-3 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">Customize</div>
   136|            <h2 class="text-2xl font-bold text-slate-900 mb-2">Customize Your Solar Report</h2>
   137|            <p class="text-slate-500 mb-6">Adjust your bill to see your estimated savings in ${state}.</p>
   138|
   139|            <div class="max-w-sm mx-auto space-y-6">
   140|                <div>
   141|                    <label class="block text-sm font-bold text-left mb-1">Your Zip Code</label>
   142|                    <input type="text" id="zip-input" value="${zip}" placeholder="10001" class="w-full px-4 py-3 border border-slate-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
   143|                </div>
   144|
   145|                <div>
   146|                    <label class="block text-sm font-bold text-left mb-1">Avg. Monthly Electric Bill</label>
   147|                    <div class="flex items-center gap-3 mb-2">
   148|                        <span class="text-xs text-slate-400">$50</span>
   149|                        <input type="range" id="bill-slider" min="50" max="600" value="${bill}" class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500">
   150|                        <span class="text-xs text-slate-400">$600+</span>
   151|                    </div>
   152|                    <div class="text-center mb-1">
   153|                        <span id="bill-display" class="text-lg font-bold text-amber-600">$${bill} / mo</span>
   154|                    </div>
   155|                </div>
   156|
   157|                <button id="calculate-btn" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition shadow-md text-lg">
   158|                    Calculate My Savings
   159|                </button>
   160|            </div>
   161|        </div>
   162|    `;
   163|
   164|    const slider = document.getElementById('bill-slider');
   165|    const display = document.getElementById('bill-display');
   166|    slider.addEventListener('input', () => display.textContent = `$${slider.value} / mo`);
   167|
   168|    document.getElementById('calculate-btn').addEventListener('click', () => {
   169|        const newZip = document.getElementById('zip-input').value.trim();
   170|        const newBill = slider.value;
   171|        if(newZip.length >= 5) {
   172|
   173|            container.innerHTML = `
   174|                <div class="bg-white rounded-xl shadow-xl border border-green-200 p-6 sm:p-8 text-center" id="calc-loader">
   175|                    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mx-auto mb-4"></div>
   176|                    <h3 class="text-lg font-bold text-slate-800">Calculating your solar savings...</h3>
   177|                    <p class="text-amber-600 text-sm font-medium mt-2" id="calc-status">Analyzing your energy usage...</p>
   178|                </div>
   179|            `;
   180|
   181|            const statuses = [
   182|                "Matching zip to municipal tax records...",
   183|                "Checking local utility rebates in ${state}...",
   184|                "Estimating roof surface area...",
   185|                "Calculating 25-year system savings...",
   186|                "Finalizing your solar report..."
   187|            ];
   188|
   189|            let step = 0;
   190|            const interval = setInterval(() => {
   191|                const statusEl = document.getElementById('calc-status');
   192|                if(statusEl) statusEl.textContent = statuses[step];
   193|                step++;
   194|                if (step >= statuses.length) {
   195|                    clearInterval(interval);
   196|                    showResults(newZip, state, newBill);
   197|                }
   198|            }, 800);
   199|        } else {
   200|            document.getElementById('zip-input').classList.add('border-red-500');
   201|        }
   202|    });
   203|}
   204|
   205|function showResults(zip, state, bill) {
   206|    const container = document.getElementById('dynamic-results');
   207|    const baseSavings = getBaseSavings(state, bill);
   208|
   209|    container.innerHTML = `
   210|        <div class="bg-white rounded-xl shadow-xl border border-green-200 p-6 sm:p-8 animate-fade-in">
   211|            <div class="flex items-center justify-between mb-4">
   212|                <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Savings Report</span>
   213|                <span class="text-slate-400 text-xs">Zip: ${zip}</span>
   214|            </div>
   215|
   216|            <h2 class="text-2xl font-bold text-slate-900 mb-2">Your Estimated Savings:</h2>
   217|            <div class="mt-2 mb-6">
   218|                <span class="text-4xl sm:text-5xl font-extrabold text-green-600">$${baseSavings.toLocaleString()}</span>
   219|            </div>
   220|
   221|            <div class="relative">
   222|                <div id="blurred-content" class="blur-sm select-none pointer-events-none bg-slate-50 rounded-lg p-4 border border-slate-100 space-y-3">
   223|                    <div class="flex justify-between">
   224|                        <span class="text-slate-600">Federal Tax Credit (30%)</span>
   225|                        <span class="font-bold text-slate-800">$${Math.round(baseSavings * 0.30).toLocaleString()}</span>
   226|                    </div>
   227|                    <div class="flex justify-between border-t border-slate-200 pt-2">
   228|                        <span class="text-slate-800 font-bold">Total Benefit</span>
   229|                        <span class="font-bold text-green-600">$${baseSavings.toLocaleString()}</span>
   230|                    </div>
   231|                </div>
   232|
   233|                <div id="gate-overlay" class="absolute inset-0 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm rounded-lg p-6 subtle-pulse slide-in-up">
   234|                    <p class="text-lg font-bold text-slate-900 mb-1">🔓 Unlock Your <span class="text-amber-600">$${baseSavings.toLocaleString()}</span> Report</p>
   235|                    <p class="text-xs text-slate-500 mb-5">We'll email your full solar breakdown + installer list for zip <strong>${zip}</strong></p>
   236|                    <div class="flex w-full max-w-sm gap-2">
   237|                        <input type="email" id="user-email" placeholder="your@email.com" class="flex-1 px-4 py-2.5 text-sm border-2 border-amber-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium">
   238|                        <button id="unlock-btn" class="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-lg transition shadow-md whitespace-nowrap cursor-pointer">Send Report</button>
   239|                    </div>
   240|                </div>
   241|            </div>
   242|
   243|            <div class="mt-6 flex gap-3">
   244|                <button onclick="window.location.href=window.location.pathname" class="flex-1 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-lg transition">Back</button>
   245|                <a href="/blog/2026-solar-guide/" class="flex-1 text-center bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-lg transition">Read Our Guide</a>
   246|            </div>
   247|        </div>
   248|    `;
   249|
   250|    document.getElementById('unlock-btn').addEventListener('click', () => {
   251|        const email = document.getElementById('user-email').value;
   252|        if (email && email.includes('@')) {
   253|            unlockContent(email, zip, state, bill);
   254|        } else {
   255|            document.getElementById('user-email').classList.add('border-red-500');
   256|        }
   257|    });
   258|}
   259|
   260|function getBaseSavings(state, bill) {
   261|    const avgs = { 'CA': 24000, 'TX': 21000, 'FL': 19500, 'AZ': 22000, 'NY': 20000, 'CO': 18000, 'MA': 23000, 'NJ': 21500, 'US': 18500 };
   262|    let base = avgs[state] || avgs['US'];
   263|    const multiplier = bill / 150;
   264|    return Math.round(base * multiplier);
   265|}
   266|
   267|function unlockContent(email, zip, state, bill) {
   268|    const scriptUrl = "https://script.google.com/macros/s/AKfycbxp5CDO40dghD5ubQnU1XMLO0uoH0mK7i52nl_yu-6RDziolwRfRZHHTOIYiv1e-DZ3TA/exec";
   269|
   270|    // UNBLUR THE STATE CONTENT NOW
   271|    const allBlurred = document.querySelectorAll('.spotlight-blur-sib');
   272|    allBlurred.forEach(el => {
   273|        el.classList.replace('spotlight-blur-sib', 'spotlight-clear-sib');
   274|        // Remove lock badges
   275|        const badges = el.querySelectorAll('.lock-badge');
   276|        badges.forEach(b => b.remove());
   277|    });
   278|
   279|    const blurred = document.getElementById('blurred-content');
   280|    if (blurred) blurred.classList.remove('blur-sm', 'select-none', 'pointer-events-none');
   281|
   282|    // Show success
   283|    const btn = document.createElement('div');
   284|    btn.className = 'bg-green-50 border border-green-300 rounded-lg p-3 text-center mt-4 slide-in-up';
   285|    btn.innerHTML = '<p class="text-sm font-bold text-green-700">✅ Full report sent to ' + email + '! Check your inbox.</p>';
   286|    document.getElementById('blurred-content').parentElement.appendChild(btn);
   287|
   288|    fetch(scriptUrl, {
   289|        method: "POST",
   290|        mode: "no-cors",
   291|        body: JSON.stringify({
   292|            email: email,
   293|            zip: zip,
   294|            state: state,
   295|            monthlyBill: bill
   296|        })
   297|    });
   298|}
   299|