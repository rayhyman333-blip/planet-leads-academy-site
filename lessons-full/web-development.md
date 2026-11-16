# Web Development

*Local draft lesson text for Planet Leads Academy. This is study material only.*

## Lesson 1: How the Web Works and Your First Page

When you type an address into a browser, several things happen in a fraction of a second. Your browser sends a request over the internet to a server, the server sends back files, and the browser reads those files and draws a page. The three files at the heart of almost every page are HTML for structure, CSS for appearance, and JavaScript for behaviour. Learning them in that order matters: if the structure is wrong, styling and behaviour built on top of it will be fragile.

HTML stands for HyperText Markup Language. It is not a programming language in the usual sense; it describes what things are. A paragraph is a paragraph, a heading is a heading, a link is a link. Tags mark those meanings. Most tags come in pairs: an opening tag such as `<p>` and a closing tag such as `</p>`, with the content between them. A few tags, like `<img>`, do not wrap content and are written without a separate closing tag.

A complete, minimal page has a clear skeleton. The `<!DOCTYPE html>` line tells the browser to use modern standards. The `<html>` element wraps everything. Inside it, `<head>` holds information about the page that is not shown directly, such as its title, and `<body>` holds what the visitor sees. Here is a complete example you can save as `index.html` and open in a browser:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>My First Page</title>
</head>
<body>
  <h1>Hello, web</h1>
  <p>This is my first page. It has a heading, a paragraph, and a link.</p>
  <p><a href="https://example.org">Visit Example</a></p>
</body>
</html>
```

Notice the `lang="en"` attribute. Attributes add information to a tag, and language helps screen readers pronounce text correctly. The `charset` line helps the browser show characters correctly. These small details are not decoration; they are part of building pages that work for real people.

Headings have levels from `<h1>` to `<h6>`. Use one `<h1>` for the main title of a page, then `<h2>` for major sections and `<h3>` for subsections, in order. Do not choose a heading level because you like its size. Size is a styling decision, handled later with CSS. Choosing `<h4>` for a main title just because it looks smaller creates a confusing outline for anyone using a screen reader or scanning the document structure.

Common mistakes in this lesson are easy to spot once you know them. The most frequent is forgetting a closing tag, which can swallow the rest of the page into one paragraph. Another is nesting tags in the wrong order, such as `<p><strong>text</p></strong>` instead of `<p><strong>text</strong></p>`. A third is writing text directly in `<body>` with no paragraph or heading around it. Browsers will still show it, but the page has no real structure to style or navigate.

**Practice:** Create `index.html` with the skeleton above, then change it into a short page about a topic you like. Include one `<h1>`, two `<h2>` sections, at least three paragraphs, one link, and one list using `<ul>` and `<li>`. Open it in a browser, then use the browser's "View Source" or inspector to check that every opening tag has its matching closing tag in the right order.

**Reading a web address:** A URL such as `https://example.org/guides/intro.html` has parts worth naming. The `https` part is the protocol, the secure way the browser asks for the page. The domain, `example.org`, names the server. The path, `/guides/intro.html`, names a file or route on that server. When you link to another page on your own site, you usually use a relative path such as `about.html` or `guides/intro.html`, which keeps the link working if the domain changes. When you link to another site, you use the full address. A broken link is usually a wrong path, a misspelled filename, or a file moved without updating the links that point to it, so check links by clicking them, not just by reading them.

## Lesson 2: Styling with CSS

CSS, Cascading Style Sheets, controls how HTML looks: colours, fonts, spacing, and layout. Keeping CSS separate from HTML is good practice. HTML says "this is a heading"; CSS says "headings in this section use this font and size". That separation means you can change the look of a whole site by editing one stylesheet instead of editing every page.

You can write CSS in three places, but for real projects an external stylesheet is best. Create a file called `styles.css` and link it in the `<head>` of your page: `<link rel="stylesheet" href="styles.css">`. Inside the stylesheet, a rule has a selector, which chooses the elements to style, and declarations inside braces, each with a property and a value:

```css
body {
  font-family: Georgia, serif;
  line-height: 1.6;
  color: #222;
  max-width: 700px;
  margin: 0 auto;
  padding: 1rem;
}

h1 {
  color: #1a5276;
}

a {
  color: #1a5276;
}
```

Selectors can target an element type (`p`), a class (`.notice`, used with `class="notice"` in HTML), or an id (`#main`, used once per page). Classes are the workhorse of everyday CSS because the same class can be reused on many elements. Use ids sparingly, for a single unique part of a page such as the main content area.

Two ideas explain much of CSS behaviour: the cascade and specificity. The cascade means that when several rules could apply, the browser follows an order: browser defaults first, then your stylesheet, with later rules and more specific selectors winning over earlier, more general ones. Specificity is a rough score: an id beats a class, a class beats a plain element selector. When a style does not seem to apply, the usual cause is that a more specific rule is winning, not that CSS is broken. Your browser's inspector will show which rules applied and which were overridden, and learning to read that panel is one of the most useful debugging skills in web development.

Spacing deserves special attention. Every element sits in a box with content in the middle, padding just outside the content, a border, and margin outside that. Padding adds space inside an element's background; margin adds space outside it. If two elements look cramped, add margin or padding deliberately rather than inserting empty paragraphs or line breaks to push things apart. Empty markup used for spacing is fragile and confusing.

Colour and type choices should serve reading. Dark text on a light background, a generous line height such as 1.5 or 1.6, and a comfortable line length (the `max-width: 700px` above keeps lines from stretching across a wide screen) all make text easier to read. Avoid very low-contrast combinations such as light grey text on white, even if they look subtle in a design tool, because many readers will struggle with them.

Common mistakes include styling with inline `style` attributes everywhere, which becomes impossible to maintain; using `!important` to force a style instead of understanding why a rule lost; and forgetting the stylesheet link or misspelling its filename, which leaves a page completely unstyled. Check the filename and path first whenever styles do not appear at all.

**Practice:** Link a stylesheet to your Lesson 1 page. Style the body with a readable font and line height, give headings a different colour, style links, and add a `.notice` class with a light background, padding, and a border. Apply that class to one paragraph. Then change only the stylesheet — not the HTML — to give the page a noticeably different look, and confirm that the structure of the page did not need to change.

**A worked spacing example:** Suppose a card contains a heading and a paragraph, and the card looks cramped. Adding `padding: 1rem` to the card gives breathing room inside its border, while adding `margin-bottom: 1.5rem` to the card gives space between it and the next card. If you instead add padding to the paragraph, only the paragraph's own background grows, which is not the same effect. When spacing looks wrong, use the browser inspector's box diagram: it shows content, padding, border, and margin separately, so you can see whether the space you added is inside or outside the element you intended.

## Lesson 3: Layout with Flexbox and Grid

Early web layout relied on tricks such as tables and floated boxes, which were never designed for page layout and made responsive design painful. Modern CSS gives you two purpose-built tools: Flexbox for arranging items in a row or a column, and Grid for arranging items in rows and columns at once. Knowing which one to reach for is half the skill.

Flexbox works on a container and its direct children. Set `display: flex` on the container, and its children line up in a row by default. The `justify-content` property controls spacing along the main axis (horizontally, in a row): `flex-start` groups items at the start, `center` centres them, `space-between` pushes the first item to the start and the last to the end, and `space-around` or `space-evenly` distribute space around them. The `align-items` property controls the cross axis (vertically, in a row), with `center` being the most common choice for vertically centred navigation bars and cards. Setting `flex-direction: column` turns the same container into a vertical stack, and `flex-wrap: wrap` lets items flow onto a new line instead of squeezing onto one.

A typical navigation bar is a good first Flexbox exercise:

```css
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
```

The `gap` property adds consistent space between items without needing margins on each child, which used to be a fiddly source of extra space at the edges. Flexbox also lets individual items grow or shrink: `flex: 1` on a child makes it take up available space, which is useful for a main content area beside a narrower sidebar.

Grid is for two-dimensional layouts, such as a page with a header, sidebar, main content, and footer, or a gallery of cards. Set `display: grid` on a container and define its columns with `grid-template-columns`. A very useful pattern is `repeat(auto-fit, minmax(220px, 1fr))`, which creates as many columns as fit, each at least 220 pixels wide, sharing the remaining space equally. As the screen narrows, columns drop away automatically, without you writing a separate layout for each screen size. For a page skeleton, named areas make the intent readable:

```css
.page {
  display: grid;
  grid-template-columns: 220px 1fr;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  gap: 1rem;
}
```

A common mistake is using Flexbox for a full page grid and fighting it with nested containers, or using Grid for a simple row of buttons and writing far more code than needed. As a rule of thumb: one direction, Flexbox; two directions, Grid. Another mistake is fixing widths in pixels everywhere. Flexible units such as `fr`, percentages, and `minmax()` let a layout adapt, while fixed pixels only work at one screen size.

**Practice:** Build a page with a header, a navigation row using Flexbox, and a card gallery using Grid with `auto-fit` and `minmax()`. Resize your browser window from wide to narrow and watch the gallery reflow. Then deliberately break it: set a fixed pixel width on the cards and compare how it behaves at a narrow width. Restore the flexible version and keep it as your layout reference page.

**Choosing between Flexbox and Grid, worked:** For a row of three social links in a footer, Flexbox with `gap` is enough, because the items run in one direction. For a photo gallery that should show four columns on a wide screen, two on a tablet, and one on a phone, Grid with `repeat(auto-fit, minmax(220px, 1fr))` does that work automatically. If you tried the gallery in Flexbox, you would need extra rules to wrap items and to keep their widths equal. If you tried the footer links in Grid, you would write column definitions for a job that a single flex row already handles. Match the tool to the shape of the layout.

## Lesson 4: JavaScript Basics — Variables, Types, and Decisions

JavaScript adds behaviour to a page: responding to clicks, checking input, updating text, and fetching data. It is a real programming language, so this lesson introduces its core building blocks carefully, because everything later depends on them.

A variable stores a value you can use later. Modern JavaScript uses `let` for values that may change and `const` for values that should not be reassigned. Prefer `const` by default and use `let` only when you know the value will change. The older `var` still appears in old tutorials; avoid it in new code because its scoping rules cause surprising bugs. Values have types: numbers (`42`, `3.5`), strings of text in quotes (`"hello"`), booleans (`true`, `false`), arrays (ordered lists, `["red", "green"]`), and objects (named collections, `{ name: "Ada", age: 36 }`).

```js
const greeting = "Hello";
let count = 0;
count = count + 1;
console.log(greeting + ", count is " + count);
```

`console.log()` prints a value to the browser console, which you open with your browser's developer tools. It is your first debugging tool: when code does not do what you expect, log the values involved and check whether they are what you assumed. Many bugs are wrong assumptions made visible.

Programs make decisions with `if` statements and comparisons. Note the difference between `=` (assign a value), `==` (compare with type conversion, best avoided), and `===` (compare value and type, the one to use). `"5" === 5` is false because one is a string and the other is a number, while `"5" == 5` is true because JavaScript converts the types. That conversion causes subtle errors, so use `===` and `!==` consistently.

```js
const age = 18;
if (age >= 18) {
  console.log("Adult");
} else {
  console.log("Under 18");
}
```

Functions package reusable steps under a name. A function takes inputs (parameters), does work, and can return a result. Writing a function once and calling it many times avoids copying the same code, and fixing a bug in one place fixes it everywhere the function is used.

```js
function totalWithTax(price, taxRate) {
  return price + price * taxRate;
}
console.log(totalWithTax(20, 0.08)); // 21.6
```

Loops repeat work. A `for` loop over an array is common: `for (const item of items) { ... }` runs the block once for each item. Avoid changing an array while looping over it unless you have a clear reason, and watch out for off-by-one errors — loops that run one time too many or too few, usually from confusing `<` with `<=` in a counted loop.

Common mistakes in this lesson include using `=` where `===` was meant inside an `if`, which assigns instead of comparing and makes the condition behave unexpectedly; forgetting that `+` on strings joins them rather than adding numbers, so `"5" + 3` gives `"53"`; and mistyping a variable name, which JavaScript treats as a different, undefined variable rather than correcting. Read error messages in the console literally: they usually name the line and the problem.

**Practice:** In the browser console or a small script file, write a function `describePrice(price)` that returns "free" for 0, "budget" for prices under 20, "standard" for prices under 100, and "premium" otherwise. Test it with 0, 5, 20, 99, 100, and 250, logging each result. Then write a loop that prints each item of an array of three product names with its position, starting from 1 rather than 0, and check the output matches what you intended.

**A worked debugging example:** Suppose `totalWithTax(20, 0.08)` returns `21.6` but your page shows `208`. The likely cause is that the price came from an input field, where values are always strings, so `"20" + "20" * 0.08` is not what you think: multiplication converts to a number, but a later `+` with a string joins instead of adding. Converting first with `Number(price)` makes the arithmetic behave. Whenever a number looks like two numbers stuck together, check the type with `typeof` in the console before assuming the formula is wrong.

## Lesson 5: The DOM — Making Pages Respond

The Document Object Model, or DOM, is the browser's live representation of your HTML as a tree of objects that JavaScript can read and change. When JavaScript changes the DOM, the page on screen changes without reloading. That is how menus open, messages appear, and lists update in place.

You select elements with methods such as `document.querySelector()`, which returns the first element matching a CSS selector, and `document.querySelectorAll()`, which returns all matching elements. Give interactive elements clear ids or classes so your selectors are easy to read: `document.querySelector("#message")` is clearer than a long chain of positional selectors that break when the markup changes.

```html
<p id="message">Welcome.</p>
<button id="changeBtn">Change message</button>
<script>
  const message = document.querySelector("#message");
  const button = document.querySelector("#changeBtn");
  button.addEventListener("click", function () {
    message.textContent = "Thanks for clicking!";
  });
</script>
```

`addEventListener("click", ...)` says: when this element is clicked, run this function. The function is called an event handler. Prefer `addEventListener` over inline `onclick` attributes in HTML, because it keeps behaviour in your script, lets you attach more than one handler, and is easier to maintain. Other common events include `input` (fired as a user types), `submit` (fired when a form is sent), and `change` (fired when a selection changes).

To change content safely, use `textContent` for plain text. It treats the value as text, not markup. `innerHTML` inserts HTML, which is powerful but dangerous with untrusted input: if user-supplied text is inserted with `innerHTML`, a malicious user could inject script markup. For this course, use `textContent` unless you have a specific reason to insert markup, and never insert raw user input with `innerHTML`.

You can also change classes, which is often better than changing individual styles from JavaScript. Toggling a class such as `hidden` or `open` lets CSS decide what that state looks like, keeping presentation in the stylesheet: `element.classList.toggle("open")` adds the class if it is absent and removes it if present. Building a new element follows a similar pattern: create it with `document.createElement()`, set its text, and append it with `appendChild()`.

A frequent mistake is running a script before the elements it needs exist. If your script is in the `<head>` without waiting, `querySelector` returns `null` and the next line fails. The simplest fix is to place your script at the end of `<body>`, after the markup it uses, or to use the `defer` attribute on an external script, which tells the browser to run it after the page has been parsed. Another mistake is selecting elements inside a handler every time it runs when a single selection outside the handler would do; select once, reuse the reference.

**Practice:** Build a small page with a heading, a paragraph, a button, and an empty list. When the button is clicked, add a new list item saying "Item 1", then "Item 2", counting upward on each click, using `textContent` and `appendChild()`. Add a second button that toggles a class on the page to switch between a light and a dark colour scheme, with all colours defined in CSS. Test both buttons, then check in the inspector that the DOM actually changed as expected.

**A worked toggle example:** A common pattern is a button that shows or hides extra information. Give the extra paragraph a class of `hidden` in CSS with `display: none`, and in JavaScript call `details.classList.toggle("hidden")` when the button is clicked. Also change the button's text between "Show more" and "Show less" so the control describes its current action. This keeps the state in one place — the presence of the class — instead of scattering separate style changes through your script, and it means a designer can restyle the hidden state in CSS without touching the JavaScript.

## Lesson 6: Forms, Input, and Validation

Forms are how users send information to a site: sign-ups, contact messages, orders, and searches. A form is built from `<form>`, labelled controls such as `<input>`, `<textarea>`, and `<select>`, and a submit button. Good forms are usable, accessible, and validated in two places: in the browser for immediate feedback, and on the server for security, because browser checks can always be bypassed.

Every control needs a visible `<label>` linked to it with matching `for` and `id` attributes. A label that only exists as placeholder text inside the input is not a substitute: placeholder text disappears as soon as the user types, and many screen readers do not announce it as a label. Write labels that say what is wanted, such as "Email address", not "Enter here".

```html
<form id="signup">
  <label for="email">Email address</label>
  <input type="email" id="email" name="email" required>
  <label for="name">Full name</label>
  <input type="text" id="name" name="name" required>
  <button type="submit">Sign up</button>
  <p id="formMessage"></p>
</form>
```

The `type` attribute matters: `type="email"` asks the browser to check for an email-like shape and shows an email keyboard on phones; `type="number"` is for numbers; `type="password"` hides typed characters. The `required` attribute tells the browser the field must not be empty. These built-in checks give you basic validation without any JavaScript, and you should use them before writing custom checks.

For custom feedback, listen for the form's `submit` event and call `event.preventDefault()` to stop the browser sending the form while you check the values. Then show a clear message near the problem, not only at the top of the page, and put focus back on the field that needs fixing. Messages should say what is wrong and how to fix it: "Enter an email address, for example name@example.com" is useful; "Invalid input" is not.

```js
const form = document.querySelector("#signup");
form.addEventListener("submit", function (event) {
  event.preventDefault();
  const email = document.querySelector("#email").value.trim();
  const message = document.querySelector("#formMessage");
  if (!email.includes("@")) {
    message.textContent = "Enter an email address containing @.";
    document.querySelector("#email").focus();
    return;
  }
  message.textContent = "Thank you. Your details were received.";
});
```

Common mistakes include forgetting `preventDefault()`, so the page reloads and your message vanishes; validating only on submit and never clearing an old error after the user fixes it; and trusting browser validation as security. Browser validation improves the experience, but a server must re-check everything before storing or acting on it, because anyone can send a request that skips the browser entirely. Also, never ask for or store passwords, card numbers, or other sensitive data in a practice form, and never log such values to the console.

**Practice:** Build the form above and add a third field for a short message with a maximum length, enforced with `maxlength` and a clear message when it is empty. Test four cases: all fields valid, email missing `@`, a required field empty, and a submission after fixing an error, confirming the old error message is replaced. Check with keyboard-only navigation that every label can be reached and that pressing Enter submits the form.

**A worked validation example:** Consider a name field that must contain at least two characters. The browser's `required` attribute only checks that it is not empty, so a single letter would pass. A custom check can test `name.trim().length < 2` and show "Enter your full name, at least two characters." Trimming matters: without it, a field containing only spaces looks non-empty to a simple check but contains no real name. Always trim text input before measuring it, and always clear a previous error message when the user submits again successfully, so old feedback does not linger beside a now-valid form.


**Testing a form like a user:** After building a form, test it the way a visitor will use it, not the way you built it. Tab through the fields in order, try submitting with each field empty in turn, enter an obviously wrong email, then correct it and submit again. Each test should produce the message you intended, in the place you intended, and no test should reload the page and lose the message. Writing these cases down as a short checklist makes the test repeatable, and repeating it after any later change catches regressions before visitors do.

## Lesson 7: Responsive Design and Accessibility

A responsive page works on a phone, a tablet, and a desktop, not by shrinking a desktop layout until it is unreadable, but by adapting its layout to the space available. Accessibility means the same page works for people using keyboards, screen readers, magnification, or other assistive tools. The two overlap: a layout that adapts cleanly and uses real semantic HTML is usually more accessible than one that does not.

Start with the viewport meta tag in `<head>`: `<meta name="viewport" content="width=device-width, initial-scale=1">`. Without it, mobile browsers pretend the screen is a wide desktop screen and shrink the page, making text tiny. With it, your CSS measurements refer to the actual screen width, and your flexible layouts from Lesson 3 can do their work.

Media queries apply styles only when a condition is true, most often a maximum or minimum width. Use them to change layout at points where the design actually breaks, not at every device size you can name. For example, a two-column grid can collapse to one column below a certain width:

```css
.page {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 1rem;
}

@media (max-width: 700px) {
  .page {
    grid-template-columns: 1fr;
  }
}
```

A mobile-first approach reverses the habit: write the single-column, small-screen styles first, then add `min-width` queries that enhance the layout as space grows. This tends to produce simpler CSS and ensures the small-screen experience is designed rather than left over.

Accessibility is built from choices you have already met, used consistently. Use real buttons for actions (`<button>`) and real links for navigation (`<a href>`); a `<div>` styled to look like a button is not keyboard-focusable or announced as a button by default. Give images meaningful `alt` text describing their content, or an empty `alt=""` when an image is purely decorative, so screen readers skip it instead of reading a filename. Keep heading order logical, keep colour contrast strong, and never convey information by colour alone — pair colour with text or an icon, so a red error is also a written error message.

Test accessibility the way users experience it. Navigate your page using only the Tab key: can you reach every link, button, and form control, and can you see where focus is? Zoom the page to 200% in the browser: does content still read in a sensible order, or does it overlap? Turn on a screen reader if one is available on your device and listen to a page's headings and landmarks. These quick tests catch far more problems than any checklist read in isolation.

Common mistakes include hiding the focus outline with CSS (`outline: none`) without providing another visible focus style, which leaves keyboard users lost; writing `alt` text such as "image" or a filename, which adds noise without information; and designing only at desktop width, then discovering at the end that navigation, tables, or images overflow a phone screen. Check narrow widths early and often, not at the end.

**Practice:** Take your layout page from Lesson 3 and add the viewport tag and a media query that collapses it to one column below 700 pixels. Then audit it: tab through the whole page with a keyboard, zoom to 200%, and check every image's `alt` text and every link's purpose. Fix each issue you find, and write down the three checks you will repeat on every future page.

**A worked responsive check:** Take a page with a sidebar and main content side by side. At desktop width it reads well, but at 400 pixels wide the sidebar squeezes the main text into a narrow column. The fix is not to shrink the text but to stack the sections: in a media query below 700 pixels, set the grid to a single column so the sidebar appears above or below the main content in full width. Then check the order: does the main content still come in a sensible reading order for a screen reader, or does the sidebar now interrupt it? Layout order and reading order should agree.

## Lesson 8: Putting It Together — A Finished Project

This final lesson turns the separate skills into one finished, small website: a three-page portfolio or small-business site with shared styling, working navigation, an interactive element, and a contact form. Working through a complete project exposes the integration problems that isolated exercises hide, such as paths that work on one page but not another, and styles that leak where they were not intended.

Plan the site before you code it. Decide its purpose in one sentence, its three pages (for example Home, About, and Contact), and what each page must contain. Sketch each page's sections on paper or in a plain list: header and navigation, main content, footer. Keep the plan small enough to finish. A finished small site teaches more than an ambitious site that is never completed, and you can extend it afterwards.

Use a consistent file structure. Put all pages in one folder, one shared `styles.css`, and one shared `script.js`, and link to them with the same relative paths from every page, such as `href="styles.css"` and `src="script.js"`. Relative paths are a common source of confusion: `styles.css` means "in the same folder as this page", while `/styles.css` means "at the root of the site", which behaves differently when you preview files locally versus on a hosted site. Test every page by opening it directly and clicking every navigation link, not just by testing the home page.

Reuse what you built: the Flexbox navigation from Lesson 3, the Grid card layout for a projects or products section, the DOM interaction from Lesson 5 (for example, a button that reveals more detail about a project), and the validated form from Lesson 6 on the Contact page. Add the responsive behaviour and accessibility checks from Lesson 7 to all three pages. When something breaks, work through it systematically: check the browser console for errors, check the inspector to see which styles applied, and check one page at a time rather than changing several files at once and guessing which change fixed it.

Before calling the project finished, run a final review. Does every page have a descriptive `<title>`? Does every image have `alt` text? Does the site work at phone width and at desktop width? Can it be used entirely by keyboard? Does the form give clear feedback for both valid and invalid input? Are there any console errors? Write the answers down as a short checklist and fix anything that fails, then test once more after the fix.

Deployment — putting the site on the internet — is a separate step from building it, and the details depend on the hosting service you use. The principle is the same everywhere: you upload the same files you tested locally, then verify the live address page by page, link by link, rather than assuming the upload worked. Keep a copy of the finished project, and keep improving it in small steps: add one new page, one new interactive feature, or one accessibility improvement at a time, testing after each step.

**Practice:** Build the three-page site described above, with shared CSS and JavaScript, responsive layout, and a working contact form with validation messages. Complete the final review checklist in full, fix every failing item, and re-test. As a finishing step, write a short paragraph for each page explaining, in your own words, what you built on it and which earlier lesson it draws on, and keep that note with the project as a record of your progress.

**Keeping a project maintainable:** After the site works, spend a short time tidying it. Use consistent names for files (all lowercase, hyphens instead of spaces), keep images in one folder, and add a brief comment at the top of your stylesheet explaining its sections. These habits cost minutes now and save much longer later, because the hardest part of returning to a project after a break is remembering how it was organised. A short README file in the project folder, listing the pages, the shared files, and how to preview the site, is a simple record that future you will be grateful for.

