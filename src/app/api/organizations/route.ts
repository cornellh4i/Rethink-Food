import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "../../../../lib/supabase";
import { validate as uuidValidate } from "uuid";

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const id = request.nextUrl.searchParams.get("id");

    const convertToInt = Number(id);
    if (!id || (!Number.isInteger(convertToInt) && !uuidValidate(id))) {
      console.error("ID is not an Integer or a UUID");
      return NextResponse.json(
        { error: "ID is not an Integer or a UUID or ID was Null" },
        { status: 400 }
      );
    }

    const { data: organization, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("No row matches ID ", error.message);
      return NextResponse.json({ error: "No row matches ID" }, { status: 404 });
    }

    const { data: deletedOrganization, error: deleteError } = await supabase
      .from("organizations")
      .delete()
      .eq("id", id)
      .select();

    if (deleteError) {
      console.error("Error fetching items:", deleteError.message);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        data: { organization: deletedOrganization[0] },
        error: null,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("Unexpected error in Delete handler");
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const requestData = await request.json();

    const orgKinds = ["restaurant", "cbo"];
    const nycBoroughs = [
      "Bronx",
      "Brooklyn",
      "Manhattan",
      "Queens",
      "Staten Island",
    ];
    const stateBPChar = new Set(["NY"]);

    const name = requestData.name;
    if (!name || typeof requestData.name !== "string") {
      console.error(
        "Organization name was not provided or name is not a string"
      );
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Bad Request: name was not provided or it is not a string",
        },
        { status: 400 }
      );
    }

    if (!requestData.org_type || !orgKinds.includes(requestData.org_type)) {
      console.error("Invalid org type or it was not provided");
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Bad Request: Invalid org type or it was not provided",
        },
        { status: 400 }
      );
    }

    if (
      !requestData.number_of_meals ||
      typeof requestData.number_of_meals !== "number" ||
      !Number.isInteger(requestData.number_of_meals)
    ) {
      console.error(
        "Invalid type for number of meals or was it was not provided"
      );
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Invalid type for number of meals or was it was not provided",
        },
        { status: 400 }
      );
    }

    const street_address = requestData.street_address;
    if (!street_address || typeof requestData.street_address !== "string") {
      console.error(
        "Organization street address was not provided or street address is not a string"
      );
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Bad Request: street address was not provided or it is not a string",
        },
        { status: 400 }
      );
    }

    if (!requestData.borough || !nycBoroughs.includes(requestData.borough)) {
      console.error(
        "Organization borough was not provided or it is invalid or borough is not a string"
      );
      return NextResponse.json(
        {
          success: false,
          data: null,
          error:
            "Bad Request: Organization borough was not provided or it is invalid or borough is not a string",
        },
        { status: 400 }
      );
    }

    if (!requestData.state || !stateBPChar.has(requestData.state)) {
      console.error("Invalid State abbreviation or it was not provided");
      return NextResponse.json(
        {
          success: false,
          data: null,
          error:
            "Bad Request: Invalid State abbreviation or it was not provided",
        },
        { status: 400 }
      );
    }

    const zip = requestData.zip;
    if (!zip || typeof requestData.zip !== "string") {
      console.error(
        "Organization zip address was not provided or zip address is not a string"
      );
      return NextResponse.json(
        {
          success: false,
          data: null,
          error:
            "Organization zip address was not provided or zip address is not a string",
        },
        { status: 400 }
      );
    }

    const created_at = requestData.created_at;
    const created_atTime = new Date(created_at);
    if (
      !created_at ||
      typeof created_at !== "string" ||
      isNaN(created_atTime.getTime())
    ) {
      console.error("Created_at time was not provided or it is invalid");
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Created_at time was not provided or it is invalid",
        },
        { status: 400 }
      );
    }

    const updated_at = requestData.updated_at;
    const updatedTime = new Date(updated_at);
    if (
      !updated_at ||
      typeof updated_at !== "string" ||
      isNaN(updatedTime.getTime())
    ) {
      console.error("Updated_at time was not provided or it is invalid");
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Updated_at time was not provided or it is invalid",
        },
        { status: 400 }
      );
    }

    const { data: addedOrganization, error } = await supabase
      .from("organizations")
      .insert(requestData)
      .select();

    if (error) {
      console.error("Internal Server Error: ", error.message);
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Internal Server Error",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: { organization: addedOrganization[0] },
        error: null,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("Unexpected error in Post handler", e);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    const { data: items, error } = await supabase
      .from('organizations')
      .select('*')
      .in('org_type', ['restaurant', 'cbo'])
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching items:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      count: items?.length || 0,
      organizations: items || []
    }, { status: 200 });
    
  } catch (e) {
    console.error('Unexpected error in GET handler:');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({
        success: false,
        data: null,
        error: "Bad request: Missing id parameter"
      }, { status: 400 });
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    
    if (!isUUID) {
      return NextResponse.json({
        success: false,
        data: null,
        error: "Bad request: Invalid UUID format"
      }, { status: 400 });
    }

    let updateData;
    try {
      const body = await request.json();
      if (!body || Object.keys(body).length === 0) {
        return NextResponse.json({
          success: false,
          data: null,
          error: "Bad request: Empty JSON body"
        }, { status: 400 });
      }
      updateData = body;
    } catch (e) {
      return NextResponse.json({
        success: false,
        data: null,
        error: "Bad request: Invalid JSON body"
      }, { status: 400 });
    }

    // Perform the update
    const { data, error } = await supabase
      .from('organizations')
      .update(updateData)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (!data) {
      return NextResponse.json({
        success: false,
        data: null,
        error: "id not found"
      }, { status: 404 });
    }

    if (error) {
      console.error('Error updating organization:', error.message);
      return NextResponse.json({
        success: false,
        data: null,
        error: "Internal Server Error"
      }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({
        success: false,
        data: null,
        error: "No Row matches"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        organization: data
      },
      error: null
    }, { status: 200 });

  } catch (e) {
    console.error('Unexpected error in PATCH handler:', e);
    return NextResponse.json({
      success: false,
      data: null,
      error: "Internal Server Error"
    }, { status: 500 });
  }
}
