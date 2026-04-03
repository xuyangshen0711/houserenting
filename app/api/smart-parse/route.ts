import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminSessionValue } from "@/lib/admin";

export async function POST(request: Request) {
  const cookieStore = await cookies();

  if (cookieStore.get("boston-nest-admin")?.value !== createAdminSessionValue()) {
    return NextResponse.json({ message: "未授权" }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: "尚未配置大模型 API Key。请在 Render 的环境变量中填入 OPENAI_API_KEY。" },
      { status: 500 }
    );
  }

  try {
    const { text } = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ message: "文案不能为空" }, { status: 400 });
    }

    const systemPrompt = `你是一个专业的波士顿房地产租赁文案解析助手。
你的任务是从用户给定的原始公寓描述/广告文案中，提取出标准的 JSON 结构。

你需要提取的字段（若文中未提及，则可为空或设为默认值）：
{
  "name": "公寓/文案主标题或名称",
  "address": "具体地址或街道（如文中没有明显标出则留空）",
  "monthlyRent": 租金数字（纯数字，优先找最低租金或单个明确租金）,
  "roomSizeSqFt": 面积大小（纯数字如 800），若无则为 null,
  "layout": "必须是这四者之一：STUDIO, ONE_BED_ONE_BATH, TWO_BED_TWO_BATH, THREE_BED_TWO_BATH",
  "hasBrokerFee": 布尔值（通常如果不提，默认 false；若提及“有中介费”等词则 true）,
  "isFurnished": 布尔值（文中提及包家具、拎包入住则视为 true）,
  "petPolicy": "必须是这三者之一：OPEN, CATS_ONLY, CATS_AND_DOGS" (默认 OPEN),
  "acceptsUndergrad": 布尔值并且默认 true（除非明确说不接受本科生）,
  "description": "整理一下原本的文案亮点，提取核心要点合并成一小段纯文字描述"
}`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `请解析以下房源文案并返回 JSON：\n\n${text}` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      })
    });

    const aiResult = await res.json();
    if (!res.ok) {
        throw new Error(aiResult.error?.message || "请求 AI 失败");
    }

    const resultText = aiResult.choices?.[0]?.message?.content || "{}";
    const parsedData = JSON.parse(resultText);

    return NextResponse.json({ message: "解析成功", data: parsedData });

  } catch (error: any) {
    return NextResponse.json({ message: `智能录入失败：${error.message}` }, { status: 500 });
  }
}
