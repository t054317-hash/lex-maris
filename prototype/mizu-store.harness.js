/**
 * Interaction harness for `prototype/mizu-store.html`.
 *
 * Drives the page with real clicks — Playwright fails a click that anything
 * intercepts, which is what caught the closed-modal overlay swallowing every
 * click behind it — and asserts the resulting state. Keep it green.
 *
 *   npm i --no-save playwright && npx playwright install chromium
 *   node mizu-store.harness.js          # expects ./preview.html
 *
 * `preview.html` is the page wrapped in a minimal document, the way the
 * Artifact viewer wraps it:
 *
 *   { echo '<!doctype html><html><head><meta charset="utf-8">'; \
 *     echo '<meta name="viewport" content="width=device-width,initial-scale=1">'; \
 *     echo '</head><body>'; cat mizu-store.html; echo '</body></html>'; } > preview.html
 */
const { chromium } = require('playwright');

const results = [];
const ok = (n, cond, extra) => results.push((cond ? 'PASS  ' : 'FAIL  ') + n + (extra !== undefined ? '  [' + extra + ']' : ''));

(async () => {
  const b = await chromium.launch();
  const url = 'file://' + process.cwd() + '/preview.html';

  // ---------- interception hit-test at three viewports ----------
  for (const [w, h] of [[1320, 900], [768, 900], [390, 844]]) {
    const pg = await b.newPage({ viewport: { width: w, height: h } });
    await pg.goto(url, { waitUntil: 'load' });
    await pg.waitForTimeout(1200);
    const blocked = await pg.evaluate(() => {
      const sels = ['#accountBtn', '#cartBtn', '#menuBtn', '[data-buy-now]', '.faq-q',
                    '[data-product-card] [data-card-swatch]', '[data-quick-add]', '[data-configure]',
                    '[data-cfg-swatch]', '#cfgAdd', '[data-thermal]', '[data-review-filter]', '#reviewNext', '#newsletterEmail'];
      const bad = [];
      sels.forEach(sel => {
        document.querySelectorAll(sel).forEach((el, i) => {
          if (i > 1) return;
          el.scrollIntoView({ block: 'center' });
          const r = el.getBoundingClientRect();
          if (r.width === 0) return;
          const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
          if (!hit || !(el.contains(hit) || hit.contains(el))) {
            bad.push(sel + ' blocked by ' + (hit ? hit.tagName + '.' + String(hit.className).slice(0, 30) : 'nothing'));
          }
        });
      });
      return bad;
    });
    ok('no control intercepted at ' + w + 'px', blocked.length === 0, blocked.join(' | ') || 'clear');
    await pg.close();
  }

  // ---------- full interaction pass, desktop ----------
  const pg = await b.newPage({ viewport: { width: 1320, height: 900 } });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(url, { waitUntil: 'load' });
  await pg.waitForTimeout(1200);

  // login modal
  await pg.click('#accountBtn');
  await pg.waitForTimeout(500);
  ok('account button opens the auth modal', await pg.evaluate(() => {
    const m = document.querySelector('#authModal');
    return m.classList.contains('open') && getComputedStyle(m.querySelector('.modal')).opacity === '1';
  }));
  await pg.click('[data-auth-tab="signup"]');
  ok('sign-up tab switches pane', await pg.evaluate(() =>
    !document.querySelector('[data-pane="signup"]').classList.contains('hidden') &&
    document.querySelector('[data-pane="signin"]').classList.contains('hidden')));
  await pg.fill('#signupName', 'Layla Al-Sabah');
  await pg.fill('#signupEmail', 'not-an-email');
  await pg.fill('#signupPassword', 'coffee123');
  await pg.fill('#signupConfirm', 'coffee123');
  await pg.click('[data-pane="signup"] button[type="submit"]');
  await pg.waitForTimeout(200);
  ok('invalid email blocks sign-up', await pg.evaluate(() =>
    document.querySelector('[data-error-for="signupEmail"]').classList.contains('on') &&
    document.querySelector('[data-error-for="signupTerms"]').classList.contains('on')));
  ok('password strength meter moves', await pg.evaluate(() => document.querySelector('#pwStrengthFill').style.width !== '0%'));
  await pg.fill('#signupEmail', 'layla@example.com');
  await pg.check('#signupTerms');
  await pg.click('[data-pane="signup"] button[type="submit"]');
  await pg.waitForTimeout(1300);
  ok('sign-up completes and header shows initials', await pg.evaluate(() =>
    document.querySelector('#accountInitials').textContent === 'LA' &&
    !document.querySelector('#authModal').classList.contains('open')));

  // swatches on a card
  const before = await pg.evaluate(() => document.querySelector('[data-card-art="tumbler-16"]').innerHTML.length + ':' + document.querySelector('[data-card-art="tumbler-16"]').innerHTML.slice(0, 400));
  await pg.click('[data-card-swatch="tumbler-16"][data-finish="green"]');
  await pg.waitForTimeout(400);
  const after = await pg.evaluate(() => document.querySelector('[data-card-art="tumbler-16"]').innerHTML.length + ':' + document.querySelector('[data-card-art="tumbler-16"]').innerHTML.slice(0, 400));
  ok('card swatch repaints the product', before !== after);
  ok('card swatch marks itself active', await pg.evaluate(() =>
    document.querySelector('[data-card-swatch="tumbler-16"][data-finish="green"]').getAttribute('aria-pressed') === 'true'));

  // details -> configurator, then configurator swatch
  await pg.click('[data-configure="coffee-mug-14"]');
  await pg.waitForTimeout(900);
  ok('Details loads that product into the configurator', await pg.evaluate(() =>
    document.querySelector('#cfgName').textContent.indexOf('Coffee Mug') === 0));
  const cfgBefore = await pg.evaluate(() => document.querySelector('#cfgArt').innerHTML.slice(0, 300));
  await pg.click('[data-cfg-swatch="sand"]');
  await pg.waitForTimeout(500);
  ok('configurator swatch changes art, name and specs', await pg.evaluate(() =>
    document.querySelector('#cfgColorName').textContent === 'Sand Desert' &&
    document.querySelector('#cfgMeta').textContent.indexOf('96 mm') > -1), await pg.evaluate(() => document.querySelector('#cfgColorName').textContent));
  ok('configurator art actually redrew', cfgBefore !== await pg.evaluate(() => document.querySelector('#cfgArt').innerHTML.slice(0, 300)));

  // thermal toggle + single-wall product
  await pg.click('[data-thermal="cold"]');
  await pg.waitForTimeout(400);
  ok('cold toggle updates the reading', await pg.evaluate(() => document.querySelector('#thermalHours').textContent === '12 hours'),
     await pg.evaluate(() => document.querySelector('#thermalHours').textContent));
  await pg.click('[data-configure="camp-cup-12"]');
  await pg.waitForTimeout(700);
  ok('single-wall cup hides the switch and says so', await pg.evaluate(() =>
    document.querySelector('#thermalToggle').hidden && document.querySelector('#thermalHours').textContent === 'Single-wall'));

  // add to cart -> badge + drawer
  await pg.click('[data-quick-add="tumbler-16"]');
  await pg.waitForTimeout(700);
  ok('add to cart increments the badge', await pg.evaluate(() => document.querySelector('#cartCount').textContent === '1' && document.querySelector('#cartCount').classList.contains('on')));
  ok('add to cart slides the drawer open', await pg.evaluate(() => {
    const d = document.querySelector('#cartDrawer');
    return d.classList.contains('open') && d.getBoundingClientRect().right <= window.innerWidth + 1 && getComputedStyle(d).visibility === 'visible';
  }));
  await pg.click('[data-line-qty="0"][data-delta="1"]');
  await pg.waitForTimeout(300);
  ok('drawer quantity stepper works', await pg.evaluate(() => document.querySelector('#cartCount').textContent === '2'));
  await pg.fill('#promoInput', 'mizu10');
  await pg.click('#promoForm button[type="submit"]');
  await pg.waitForTimeout(300);
  ok('promo code applies a discount', await pg.evaluate(() => !document.querySelector('#discountRow').hidden));
  ok('free shipping bar filled', await pg.evaluate(() => parseFloat(document.querySelector('#shipFill').style.width) > 99));

  // checkout
  await pg.click('#checkoutBtn');
  await pg.waitForTimeout(600);
  ok('checkout modal opens with lines', await pg.evaluate(() =>
    document.querySelector('#checkoutModal').classList.contains('open') && document.querySelectorAll('#checkoutLines > div').length === 1));
  await pg.fill('#coEmail', 'nope');
  await pg.click('#payBtn');
  await pg.waitForTimeout(200);
  ok('checkout validates the email', await pg.evaluate(() => document.querySelector('[data-error-for="coEmail"]').classList.contains('on')));
  await pg.fill('#coEmail', 'layla@example.com');
  await pg.fill('#coCity', 'Kuwait City');
  await pg.click('#payBtn');
  await pg.waitForTimeout(1600);
  ok('order completes and empties the cart', await pg.evaluate(() =>
    !document.querySelector('#checkoutDone').classList.contains('hidden') &&
    /^MZ-\d{6}$/.test(document.querySelector('#doneOrderId').textContent) &&
    document.querySelector('#cartCount').textContent === '0'));
  await pg.keyboard.press('Escape');
  await pg.waitForTimeout(400);

  // FAQ
  await pg.evaluate(() => document.querySelector('#faq').scrollIntoView());
  const faq = pg.locator('.faq-item').nth(2);
  await faq.locator('.faq-q').click();
  await pg.waitForTimeout(500);
  ok('FAQ item expands on click', await pg.evaluate(() => {
    const items = [...document.querySelectorAll('.faq-item')];
    const third = items[2];
    return third.classList.contains('open') && third.querySelector('.faq-q').getAttribute('aria-expanded') === 'true' &&
      third.querySelector('.faq-a').getBoundingClientRect().height > 20 && items.filter(i => i.classList.contains('open')).length === 1;
  }));
  await faq.locator('.faq-q').click();
  await pg.waitForTimeout(500);
  ok('FAQ item collapses again', await pg.evaluate(() => {
    const third = document.querySelectorAll('.faq-item')[2];
    return !third.classList.contains('open') && third.querySelector('.faq-a').getBoundingClientRect().height < 4;
  }));

  // reviews, currency, search, filter, newsletter
  await pg.click('[data-review-filter="media"]');
  await pg.waitForTimeout(400);
  ok('review filter narrows the carousel', await pg.evaluate(() => {
    const cards = [...document.querySelectorAll('#reviewRail > article')];
    return cards.length === 5 && cards.every(c => /Photo review|Video review/.test(c.textContent));
  }), await pg.evaluate(() => document.querySelectorAll('#reviewRail > article').length));
  await pg.click('#reviewNext');
  await pg.waitForTimeout(700);
  ok('carousel arrow advances', await pg.evaluate(() => document.querySelector('[data-review-dot="1"]').getAttribute('aria-current') === 'true'));

  await pg.selectOption('#currencySelect', 'EUR');
  await pg.waitForTimeout(500);
  ok('currency switch re-prices the page', await pg.evaluate(() =>
    document.querySelector('#cfgPrice').textContent.indexOf('€') === 0 &&
    document.querySelector('[data-price-for="tumbler-16"]').textContent.indexOf('€') === 0));

  await pg.fill('#searchInput', 'camp');
  await pg.waitForTimeout(400);
  ok('search filters the grid and suggests', await pg.evaluate(() =>
    document.querySelectorAll('[data-product-card]').length === 1 &&
    !document.querySelector('#searchResults').classList.contains('hidden')));
  await pg.fill('#searchInput', '');
  await pg.click('[data-filter="cup"]');
  await pg.waitForTimeout(400);
  ok('category filter works', await pg.evaluate(() => document.querySelectorAll('[data-product-card]').length === 1));
  await pg.click('[data-filter="all"]');
  await pg.waitForTimeout(300);
  ok('catalogue renders all six vessels', await pg.evaluate(() => document.querySelectorAll('[data-product-card]').length === 6));

  await pg.fill('#newsletterEmail', 'bad');
  await pg.click('#newsletterForm button[type="submit"]');
  await pg.waitForTimeout(200);
  ok('newsletter rejects a bad address', await pg.evaluate(() => document.querySelector('#newsletterError').classList.contains('on')));
  await pg.fill('#newsletterEmail', 'layla@example.com');
  await pg.click('#newsletterForm button[type="submit"]');
  await pg.waitForTimeout(1000);
  ok('newsletter shows a success toast', await pg.evaluate(() => /on the list/.test(document.querySelector('#toastStack').textContent)));

  ok('no page errors during the whole pass', errs.length === 0, errs.join(' | ') || 'none');
  await pg.screenshot({ path: 'v2-desktop-state.png' });
  await pg.close();

  // ---------- mobile pass ----------
  const pm = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const merrs = []; pm.on('pageerror', e => merrs.push(e.message));
  await pm.goto(url, { waitUntil: 'load' });
  await pm.waitForTimeout(1200);
  await pm.click('#menuBtn');
  await pm.waitForTimeout(600);
  ok('mobile menu opens', await pm.evaluate(() => document.querySelector('#mobileMenu').getBoundingClientRect().height > 100));
  await pm.click('#mobileMenu a[href="#collection"]');
  await pm.waitForTimeout(700);
  ok('mobile menu closes on navigation', await pm.evaluate(() => document.querySelector('#mobileMenu').getBoundingClientRect().height < 4));
  await pm.click('[data-quick-add="tumbler-16-ceramic"]');
  await pm.waitForTimeout(700);
  ok('mobile add to cart opens the drawer', await pm.evaluate(() =>
    document.querySelector('#cartDrawer').classList.contains('open') && document.querySelector('#cartCount').textContent === '1'));
  await pm.click('#cartDrawer [data-close-overlay]');
  await pm.waitForTimeout(500);
  await pm.click('#accountBtn');
  await pm.waitForTimeout(500);
  ok('mobile login modal opens', await pm.evaluate(() => document.querySelector('#authModal').classList.contains('open')));
  await pm.keyboard.press('Escape');
  await pm.waitForTimeout(400);
  await pm.evaluate(() => document.querySelector('#faq').scrollIntoView());
  await pm.click('.faq-item:nth-child(2) .faq-q');
  await pm.waitForTimeout(500);
  ok('mobile FAQ expands', await pm.evaluate(() => document.querySelectorAll('.faq-item')[1].classList.contains('open')));
  ok('no mobile page errors', merrs.length === 0, merrs.join(' | ') || 'none');
  ok('no mobile horizontal overflow', await pm.evaluate(() => document.documentElement.scrollWidth <= 390));
  await pm.screenshot({ path: 'v2-mobile-state.png' });
  await pm.close();

  await b.close();
  console.log(results.join('\n'));
  const fails = results.filter(r => r.startsWith('FAIL')).length;
  console.log('\n' + (results.length - fails) + '/' + results.length + ' checks passed');
  process.exit(fails ? 1 : 0);
})();
