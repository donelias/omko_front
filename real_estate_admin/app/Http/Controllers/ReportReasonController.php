<?php

namespace App\Http\Controllers;

use App\Models\report_reasons;
use App\Models\user_reports;
use App\Services\BootstrapTableService;
use App\Services\ResponseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReportReasonController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        if (!has_permissions('read', 'report_reason')) {
            return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
        }
        return view('reports.index');
    }

    public function users_reports()
    {
        if (!has_permissions('read', 'user_reports')) {
            return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
        }
        return view('reports.user_reports');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        if (!has_permissions('create', 'report_reason')) {
            return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
        }
        $report_reason = new report_reasons();
        $report_reason->reason = $request->reason;
        $report_reason->save();
        ResponseService::successRedirectResponse('Reason Added Successfully');
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request)
    {
        if (!has_permissions('read', 'report_reason')) {
            ResponseService::errorResponse(PERMISSION_ERROR_MSG);
        }
        $offset = $request->input('offset', 0);
        $limit = $request->input('limit', 10);
        $sort = $request->input('sort', 'sequence');
        $order = $request->input('order', 'ASC');

        $sql = report_reasons::orderBy($sort, $order);

        if (isset($_GET['search']) && !empty($_GET['search'])) {
            $search = $_GET['search'];
            $sql->where('id', 'LIKE', "%$search%")->orwhere('reason', 'LIKE', "%$search%");
        }


        $total = $sql->count();

        if (isset($_GET['limit'])) {
            $sql->skip($offset)->take($limit);
        }


        $res = $sql->get();
        // return $res;
        $bulkData = array();
        $bulkData['total'] = $total;
        $rows = array();
        $tempRow = array();
        $count = 1;


        $operate = '';


        foreach ($res as $row) {
            $tempRow = $row->toArray();

            $operate = BootstrapTableService::editButton('', true, null, null, $row->id);
            $operate .= BootstrapTableService::deleteButton(route('reasons.destroy', $row->id), $row->id);
            $tempRow['operate'] = $operate;
            $rows[] = $tempRow;
            $count++;
        }

        $bulkData['rows'] = $rows;
        return response()->json($bulkData);
    }
    public function user_reports_list(Request $request)
    {
        if (!has_permissions('read', 'user_reports')) {
            ResponseService::errorResponse(PERMISSION_ERROR_MSG);
        }
        $offset = $request->input('offset', 0);
        $limit = $request->input('limit', 10);
        $sort = $request->input('sort', 'id');
        $order = $request->input('order', 'ASC');

        $sql = user_reports::has('property');
        if ($sort == "reason") {
            $sql = $sql->with('customer')->with(['reason' => function ($q) use ($order) {
                $q->orderBy('reason', $order);
            }])->with('property.category');
        } else if ($sort == "customer_name") {
            $sql = $sql->with('reason')->with(['customer' => function ($q) use ($order) {
                $q->orderBy('name', $order);
            }])->with('property.category');
        } else {
            $sql = $sql->with('customer')->with('reason')->with('property.category')->orderBy($sort, $order);
        }

        if (isset($_GET['search']) && !empty($_GET['search'])) {
            $search = $_GET['search'];
            $sql->where('id', 'LIKE', "%$search%")->orwherehas('reason', function ($q1) use ($search) {
                $q1->where('reason', 'LIKE', "%$search%");
            })->orwherehas('customer', function ($q1) use ($search) {
                $q1->where('name', 'LIKE', "%$search%");
            });
        }

        $total = $sql->count();

        if (isset($_GET['limit'])) {
            $sql->skip($offset)->take($limit);
        }

        $res = $sql->get();
        $bulkData = array();
        $bulkData['total'] = $total;
        $rows = array();
        $tempRow = array();
        $count = 1;
        $operate = '';

        foreach ($res as $row) {
            if(collect($row->property)->isNotEmpty()){
                $tempRow = $row->toArray();
                if ($row->reason_id == 0) {
                    $tempRow['reason'] = $row->other_message;
                } else {
                    $tempRow['reason'] = $row->reason->reason;
                }
                $tempRow['property_title'] = BootstrapTableService::editButton('', true, '#ViewPropertyModal', 'view-property', null, null, '', 'bi bi-building edit_icon');
                $tempRow['operate'] = $operate;
                $rows[] = $tempRow;
                $count++;
            }
        }

        $bulkData['rows'] = $rows;
        return response()->json($bulkData);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        if (!has_permissions('update', 'report_reason')) {
            return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
        }
        $report_reason = report_reasons::find($request->edit_id);
        $report_reason->reason = $request->edit_reason;
        $report_reason->save();
        ResponseService::successRedirectResponse('Reason Updated Successfully');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        if (env('DEMO_MODE') && Auth::user()->email != "superadmin@gmail.com") {
            return redirect()->back()->with('error', 'This is not allowed in the Demo Version');
        }
        if (!has_permissions('delete', 'report_reason')) {
            return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
        } else {
            $report_reason = report_reasons::find($id);
            if ($report_reason->delete()) {
                user_reports::where('reason_id', $id)->delete();
                ResponseService::successRedirectResponse('Reason Deleted Successfully');
            } else {
                ResponseService::errorRedirectResponse(null, 'Something Wrong');
            }
        }
    }
}
