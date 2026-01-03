# Dynamic Wallpaper Service

A premium, minimalist wallpaper generator for OLED screens, built with Next.js, Satori, and Sharp.

## Features

* **Standardized Layouts**: Perfectly optimized for mobile lock screens with safe areas for the clock and system icons.
* **Three Dynamic Views**:
* **Yearly**: A minimalist grid tracking progress through the year.
* **Monthly**: A centered card widget showing the current month.
* **Daily**: A premium circular progress ring tracking your day.


* **Global Support**: Full time zone customization.

## API Usage

The primary endpoint is `/api/wallpaper`.

### Query Parameters

| Parameter | Description | Options |
| --- | --- | --- |
| `view` | Manually select a view | `year`, `month`, `daily` |
| `tz` | Set the time zone | Any IANA time zone (e.g. `America/Los_Angeles`) |
| `width` | Image width | Default: `1179` |
| `height` | Image height | Default: `2556` |

### Examples

#### PST (Pacific Standard Time)

To get a daily progress wallpaper for someone in Los Angeles:
`https://your-domain.com/api/wallpaper?view=daily&tz=America/Los_Angeles`

#### EST (Eastern Standard Time)

To get a monthly calendar for someone in New York:
`https://your-domain.com/api/wallpaper?view=month&tz=America/New_York`

---

## iOS Automation Setup (Every 15 Minutes)

Because iOS does not natively support "every 15 minutes" triggers, you must use a **Focus Mode Loop** to keep the service running reliably in the background.

### Step 1: Create a Trigger Focus

1. Open **Settings > Focus**.
2. Tap **+** to create a new **Custom** Focus.
3. Name it `Trigger` and choose any icon.
4. **Important**: Under "Allow Notifications," ensure all your important people and apps are allowed so your phone functions normally while this is active.

### Step 2: Create the "Update Wallpaper" Shortcut

1. Open the **Shortcuts** app and create a new Shortcut named `Set Dynamic Wallpaper`.
2. Add **Adjust Date**: Set it to `Add 15 minutes to Current Date`.
3. Add **Set Focus**:
* Set it to `Turn Trigger On`.
* Tap **Until** and select **Time**.
* Long-press the empty "Time" field, choose **Select Magic Variable**, and pick the **Adjusted Date** from the previous step.


4. Add **Get Contents of URL**: Enter your API URL (e.g., `https://your-domain.com/api/wallpaper?view=year`).
5. Add **Set Wallpaper Photo**:
* Set **Wallpaper** to the **Contents of URL**.
* Tap the blue arrow icon in the action and toggle **OFF** "Show Preview".


6. Tap **Done**.

### Step 3: Create the Automation

1. In the Shortcuts app, go to the **Automation** tab and tap **+**.
2. Select **Focus** and choose your `Trigger` Focus.
3. Select **When Turning Off** and **Run Immediately**.
4. Set the action to **Run Shortcut** and select your `Set Dynamic Wallpaper` shortcut.

### Step 4: Start the Loop

Run the `Set Dynamic Wallpaper` shortcut **manually once**. It will set the wallpaper, enable the Focus for 15 minutes, and then re-trigger itself indefinitely.

---

## Tech Stack

* **Framework**: Next.js
* **Rendering**: [Satori](https://github.com/vercel/satori) (React to SVG)
* **Image Processing**: [Sharp](https://sharp.pixelplumbing.com/) (SVG to PNG)
* **Typography**: Embedded Inter Font

## Future Improvements

* [ ] Refine layouts and scaling for different device screen sizes (tablets, different aspect ratio phones).
* [ ] Add more style options (light mode, custom accent colors).