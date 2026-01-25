<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Notifications;
use App\Models\Projects;
use App\Models\Setting;
use App\Models\Usertokens;
use App\Models\Category;
use App\Services\BootstrapTableService;
use App\Services\ResponseService;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        if (!has_permissions('read', 'project')) {
            return redirect()->back()->with('error', PERMISSION_ERROR_MSG);
        }
        $category = Category::all();
        return view('project.index',compact('category'));
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request)
    {
        if (!has_permissions('read', 'project')) {
            ResponseService::errorResponse(PERMISSION_ERROR_MSG);
        }
        $offset = $request->input('offset', 0);
        $limit = $request->input('limit', 10);
        $sort = $request->input('sort', 'sequence');
        $order = $request->input('order', 'ASC');


        $sql = Projects::with('category')->with('gallary_images')->with('documents')->with('plans')->with('customer')->orderBy($sort, $order);

        if (isset($_GET['search']) && !empty($_GET['search'])) {
            $search = $_GET['search'];
            $sql = $sql->where('id', 'LIKE', "%$search%")->orwhere('title', 'LIKE', "%$search%")->orwhere('location', 'LIKE', "%$search%")->orwhereHas('category', function ($query) use ($search) {
                $query->where('category', 'LIKE', "%$search%");
            })->orWhereHas('customer', function ($query) use ($search) {
                $query->where('name', 'LIKE', "%$search%")->orwhere('email', 'LIKE', "%$search%");
            });
        }

        if ($_GET['status'] != '' && isset($_GET['status'])) {
            $status = $_GET['status'];
            $sql = $sql->where('status', $status);
        }


        if ($_GET['category'] != '' && isset($_GET['category'])) {
            $category_id = $_GET['category'];
            $sql = $sql->where('category_id', $category_id);
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
        $currency_symbol = Setting::where('type', 'currency_symbol')->pluck('data')->first();

        foreach ($res as $row) {
            $action = BootstrapTableService::editButton('', true, null, null, $row->id, null, '', 'bi bi-eye edit_icon');

            $tempRow = $row->toArray();
            $tempRow['edit_status_url'] = 'updateProjectStatus';

            $tempRow['price'] = $currency_symbol . '' . $row->price . '/' . (!empty($row->rentduration) ? $row->rentduration : 'Month');
            $tempRow['action'] = $action;
            $rows[] = $tempRow;
            $count++;
        }


        $bulkData['rows'] = $rows;
        return response()->json($bulkData);
    }

    public function updateStatus(Request $request)
    {
        if (!has_permissions('update', 'project')) {
            ResponseService::errorResponse(PERMISSION_ERROR_MSG);
        } else {
            Projects::where('id', $request->id)->update(['status' => $request->status]);
            $project = Projects::with('customer')->find($request->id);

            if ($project->customer) {

                $fcm_ids = array();
                if ($project->customer->isActive == 1 && $project->customer->notification == 1) {
                    $user_token = Usertokens::where('customer_id', $project->customer->id)->pluck('fcm_id')->toArray();
                }

                $fcm_ids[] = $user_token;

                $msg = "";
                if (!empty($fcm_ids)) {
                    $msg = $project->status == 1 ? 'Activate now by Administrator ' : 'Deactivated now by Administrator ';
                    $registrationIDs = $fcm_ids[0];

                    $fcmMsg = array(
                        'title' =>  $project->name . 'Project Updated',
                        'message' => 'Your Project Post ' . $msg,
                        'type' => 'project_inquiry',
                        'body' => 'Your Project Post ' . $msg,
                        'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
                        'sound' => 'default',
                        'id' => (string)$project->id,
                    );
                    send_push_notification($registrationIDs, $fcmMsg);
                }
                //END ::  Send Notification To Customer

                Notifications::create([
                    'title' => $project->name . 'Project Updated',
                    'message' => 'Your Project Post ' . $msg,
                    'image' => '',
                    'type' => '1',
                    'send_type' => '0',
                    'customers_id' => $project->customer->id,
                    'projects_id' => $project->id
                ]);
            }
            $response['error'] = false;
            ResponseService::successResponse($request->status ? "Project Activated Successfully" : "Project Deactivated Successfully");
        }
    }
}
