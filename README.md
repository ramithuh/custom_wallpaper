# Dynamic Wallpaper Service

A premium, minimalist wallpaper generator for OLED screens, built with Next.js, Satori, and Sharp.

## Features

- **Standardized Layouts**: Perfectly optimized for mobile lock screens with safe areas for the clock and system icons.
- **Three Dynamic Views**: 
    - **Yearly**: A minimalist grid tracking progress through the year.
    - **Monthly**: A centered card widget showing the current month.
    - **Daily**: A premium circular progress ring tracking your day.
- **Global Support**: Full time zone customization.

## API Usage

The primary endpoint is `/api/wallpaper`.

### Query Parameters

| Parameter | Description | Options |
|-----------|-------------|---------|
| `view`    | Manually select a view | `year`, `month`, `daily` |
| `tz`      | Set the time zone | Any IANA time zone (e.g. `America/Los_Angeles`) |
| `width`   | Image width | Default: `1179` |
| `height`  | Image height | Default: `2556` |

### Examples

#### PST (Pacific Standard Time)
To get a daily progress wallpaper for someone in Los Angeles:
`http://localhost:3001/api/wallpaper?view=daily&tz=America/Los_Angeles`

#### EST (Eastern Standard Time)
To get a monthly calendar for someone in New York:
`http://localhost:3001/api/wallpaper?view=month&tz=America/New_York`

#### Default (UTC)
`http://localhost:3001/api/wallpaper`

## Tech Stack

- **Framework**: Next.js
- **Rendering**: [Satori](https://github.com/vercel/satori) (React to SVG)
- **Image Processing**: [Sharp](https://sharp.pixelplumbing.com/) (SVG to PNG)
- **Typography**: Embedded Inter Font
