"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "./supabase";

export interface CompInput {
  name: string;
  description?: string;
  tier: string;
  carry_api_name: string;
  units: any[];
  traits: any[];
  augments: any[];
  early_units: any[];
  cover_image_url?: string | null;
  is_active?: boolean;
}

export async function getCompsAction(tier?: string) {
  try {
    let query = supabase.from("tft_comps").select("*");
    if (tier) {
      query = query.eq("tier", tier);
    }
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;
    return { success: true, comps: data || [] };
  } catch (error: any) {
    console.error("getCompsAction error:", error);
    return { success: false, error: error.message, comps: [] };
  }
}

export async function createCompAction(data: CompInput) {
  try {
    const { data: newComp, error } = await supabase
      .from("tft_comps")
      .insert({
        name: data.name,
        description: data.description || "",
        tier: data.tier || "A",
        carry_api_name: data.carry_api_name,
        units: data.units || [],
        traits: data.traits || [],
        augments: data.augments || [],
        early_units: data.early_units || [],
        cover_image_url: data.cover_image_url || null,
        is_active: data.is_active !== undefined ? data.is_active : true,
      })
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/admin");
    revalidatePath("/comps");
    return { success: true, comp: newComp };
  } catch (error: any) {
    console.error("createCompAction error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateCompAction(id: string, data: Partial<CompInput>) {
  try {
    const { data: updatedComp, error } = await supabase
      .from("tft_comps")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/admin");
    revalidatePath("/comps");
    return { success: true, comp: updatedComp };
  } catch (error: any) {
    console.error("updateCompAction error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteCompAction(id: string) {
  try {
    const { error } = await supabase.from("tft_comps").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/admin");
    revalidatePath("/comps");
    return { success: true };
  } catch (error: any) {
    console.error("deleteCompAction error:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleCompAction(id: string, active: boolean) {
  try {
    const { error } = await supabase
      .from("tft_comps")
      .update({ is_active: active })
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/admin");
    revalidatePath("/comps");
    return { success: true };
  } catch (error: any) {
    console.error("toggleCompAction error:", error);
    return { success: false, error: error.message };
  }
}

export async function uploadCompImageAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "Không tìm thấy file" };
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage
      .from("comp-images")
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from("comp-images")
      .getPublicUrl(fileName);

    return { success: true, url: publicUrlData.publicUrl };
  } catch (error: any) {
    console.error("uploadCompImageAction error:", error);
    return { success: false, error: error.message };
  }
}
